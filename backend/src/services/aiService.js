import { GoogleGenAI } from '@google/genai';
import logger from '../config/logger.js';
import { AppError } from '../utils/apiResponse.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_RETRIES = 2;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenAI({ 
  apiKey: GEMINI_API_KEY,
  httpOptions: { timeout: 300000 }
});

const TEST_CASE_SCHEMA = {
  type: 'object',
  properties: {
    test_cases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          requirement_ref: { type: 'string' },
          title: { type: 'string' },
          type: { 
            type: 'string', 
            enum: ['Positive', 'Negative', 'Boundary', 'Edge', 'Security', 'Performance', 'Usability', 'API', 'Integration']
          },
          priority: { 
            type: 'string', 
            enum: ['Critical', 'High', 'Medium', 'Low']
          },
          preconditions: { type: 'string' },
          steps: { type: 'array', items: { type: 'string' } },
          expected_result: { type: 'string' },
          automation_candidate: { type: 'boolean' }
        },
        required: ['id', 'requirement_ref', 'title', 'type', 'priority', 'preconditions', 'steps', 'expected_result']
      }
    }
  },
  required: ['test_cases']
};

export class AIService {
  static async generateTestCases(ticketData) {
    try {
      if (!ticketData || !ticketData.key) {
        throw new AppError('Invalid ticket data: ticket object with key is required', 400);
      }

      logger.info(`Generating test cases for ticket: ${ticketData.key}`);

      const content = this.buildTicketContext(ticketData);

      if (!content || content.length < 50) {
        throw new AppError(
          `Ticket ${ticketData.key} has insufficient description/AC. Please ensure the ticket has a description or acceptance criteria.`, 
          400
        );
      }

      // FREE TIER: Sequential calls with delay to avoid 429
      logger.info('Generating core test cases (batch 1/2)...');
      const coreTests = await this.generateBatch(ticketData, content, 'core');

      // Wait 12 seconds between calls (free tier: 5 req/min = 1 per 12s)
      logger.info('Waiting 12s for rate limit cooldown...');
      await this.sleep(12000);

      logger.info('Generating extended test cases (batch 2/2)...');
      const extendedTests = await this.generateBatch(ticketData, content, 'extended');

      const allTestCases = [...coreTests, ...extendedTests];
      const uniqueTestCases = this.deduplicateTestCases(allTestCases);
      const prioritizedTestCases = this.prioritizeTestCases(uniqueTestCases);

      const finalTestCases = prioritizedTestCases.map((tc, index) => ({
        ...tc,
        id: `${ticketData.key}-TC${String(index + 1).padStart(3, '0')}`
      }));

      logger.info(`Generated ${finalTestCases.length} test cases for ${ticketData.key}`);

      return {
        ticketKey: ticketData.key,
        ticketSummary: ticketData.summary,
        acceptanceCriteria: ticketData.acceptanceCriteria,
        model: MODEL,
        generatedAt: new Date().toISOString(),
        totalCount: finalTestCases.length,
        testCases: finalTestCases
      };

    } catch (error) {
      logger.error(`AI generation failed: ${error.message}`);
      if (error instanceof AppError) throw error;
      this.handleGeminiError(error);
    }
  }

  static buildTicketContext(ticketData) {
  const parts = [];

  if (ticketData.summary) {
    parts.push(`USER STORY: ${ticketData.summary}`);
  }

  if (ticketData.acceptanceCriteria) {
    parts.push(`ACCEPTANCE CRITERIA:\n${ticketData.acceptanceCriteria}`);
  }

  if (ticketData.description && ticketData.description !== ticketData.acceptanceCriteria) {
    parts.push(`DESCRIPTION:\n${ticketData.description.substring(0, 3000)}`);
  }

  if (ticketData.labels?.length) {
    parts.push(`LABELS: ${ticketData.labels.join(', ')}`);
  }

  if (ticketData.components?.length) {
    parts.push(`COMPONENTS: ${ticketData.components.join(', ')}`);
  }

  if (ticketData.issueType) {
    parts.push(`ISSUE TYPE: ${ticketData.issueType}`);
  }

  return parts.join('\n\n');  // <-- FIX: was ''
}  

static async generateBatch(ticketData, fullContext, batchType) {
    const prompt = this.buildPrompt(ticketData, fullContext, batchType);

    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        logger.info(`Gemini ${batchType} attempt ${attempt}/${MAX_RETRIES} for ${ticketData.key}`);

        const response = await genAI.models.generateContent({
          model: MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: TEST_CASE_SCHEMA,
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        });

        let rawOutput = response.text;
        logger.info(`Gemini raw response for ${batchType}: ${rawOutput?.substring(0, 200)}...`);
        if (!rawOutput && response.data) {
          try {
            rawOutput = Buffer.from(response.data, 'base64').toString('utf-8');
          } catch (decodeError) {
            logger.warn(`Failed to decode Gemini inline JSON data for ${ticketData.key} (${batchType}): ${decodeError.message}`);
          }
        }
        if (!rawOutput) {
          logger.warn(`Gemini returned no text or inline JSON data for ${ticketData.key} (${batchType})`);
          return [];
        }

        const parsed = this.parseTestCases(rawOutput, ticketData.key);
        logger.info(`Parsed ${parsed.length} test cases from ${batchType} batch`);
        return parsed;

      } catch (error) {
        lastError = error;
        logger.warn(`Gemini ${batchType} attempt ${attempt} failed: ${error.message}`);

        if (error.status === 429) {
          const waitTime = error.message?.includes('retry') ? 60000 : 12000;
          logger.info(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await this.sleep(waitTime);
          if (attempt < MAX_RETRIES) continue;
        }

        if (error.status === 401 || error.status === 403) break;
        if (attempt < MAX_RETRIES) await this.sleep(3000 * attempt);
      }
    }

    // If all retries failed, return empty array instead of crashing
    logger.error(`All retries failed for ${batchType}.`);
throw new AppError(`Failed to generate ${batchType} test cases after ${MAX_RETRIES} attempts. ${lastError?.message || ''}`, 500);
    return [];
  }

  static buildPrompt(ticketData, fullContext, batchType) {
    if (batchType === 'core') {
      return `You are a senior QA engineer. Generate 20-25 CORE test cases for this Jira story.

=== STRICT RULES ===
1. EVERY test case MUST be directly derived from the acceptance criteria below.
2. DO NOT generate generic tests like "login works" or "page loads" unless explicitly required by the AC.
3. Each test case MUST reference which specific AC requirement it covers in the "requirement_ref" field.
4. Stay within the scope of the story. DO NOT invent features not mentioned.
5. Mark "automation_candidate" as true for tests that can be easily automated.

=== TICKET CONTEXT ===
${fullContext}

=== YOUR TASK ===
Generate EXACTLY these test cases:
- Positive / Happy Path: 8-10 cases (main success scenarios from AC)
- Negative / Error: 6-8 cases (invalid inputs, errors, unauthorized from AC)
- Boundary Value Analysis: 4-5 cases (min/max, empty, null, special chars from AC)
- Security: 3-4 cases (auth, injection, privilege if mentioned in AC)

=== OUTPUT FORMAT ===
Return ONLY JSON. Each test case must include:
- id: TC001, TC002...
- requirement_ref: Quote the specific AC sentence this test verifies
- title: Specific, actionable test title (max 120 chars)
- type: Positive, Negative, Boundary, or Security
- priority: Critical, High, Medium, Low
- preconditions: Setup needed
- steps: 3-7 clear, numbered steps
- expected_result: Clear pass criteria with specific values
- automation_candidate: true or false

Example:
{"test_cases":[{"id":"TC001","requirement_ref":"User can filter by date range","title":"Verify date range filter returns results within selected range","type":"Positive","priority":"High","preconditions":"User is logged in, test data exists for date range 2024-01-01 to 2024-01-31","steps":["Navigate to reports page","Click filter icon","Enter start date: 2024-01-01","Enter end date: 2024-01-31","Click Apply button"],"expected_result":"Only records between 2024-01-01 and 2024-01-31 are displayed. Total count matches expected.","automation_candidate":true}]}`;
    }

    // batchType === 'extended'
    return `You are a senior QA engineer. Generate 20-25 EXTENDED test cases for this Jira story.

=== STRICT RULES ===
1. EVERY test case MUST be directly derived from the acceptance criteria below.
2. DO NOT generate generic tests unrelated to this story.
3. Each test case MUST reference which specific AC requirement it covers.
4. Mark "automation_candidate" as true for tests that can be easily automated.

=== TICKET CONTEXT ===
${fullContext}

=== YOUR TASK ===
Generate EXACTLY these test cases:
- Edge Cases: 5-6 cases (concurrent ops, race conditions, timeouts, failures from AC)
- Performance: 5-6 cases (load, response time, memory, scalability if AC involves data volume)
- Usability / UI: 4-5 cases (cross-browser, mobile, accessibility, UX if AC involves UI)
- API: 5-6 cases (HTTP methods, status codes, validation, headers if feature involves APIs)
- Integration: 4-5 cases (component interactions, database, third-party if AC involves multiple systems)

=== OUTPUT FORMAT ===
Return ONLY JSON with:
- id: TC001, TC002...
- requirement_ref: Quote the specific AC sentence this test verifies
- title: Specific, actionable test title
- type: Edge, Performance, Usability, API, or Integration
- priority: Critical, High, Medium, Low
- preconditions: Setup needed
- steps: 3-7 clear steps
- expected_result: Clear pass criteria
- automation_candidate: true or false

Example:
{"test_cases":[{"id":"TC001","requirement_ref":"System handles 1000 concurrent users","title":"Verify system stability with 1000 concurrent filter requests","type":"Performance","priority":"High","preconditions":"Load test environment ready","steps":["Simulate 1000 concurrent users","Each user applies different date filter","Monitor for 5 minutes"],"expected_result":"Response time < 2s, no errors, CPU < 80%","automation_candidate":false}]}`;
  }

  static parseTestCases(rawOutput, ticketKey) {
    try {
      let cleanOutput = rawOutput
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const jsonStart = cleanOutput.indexOf('{');
      const jsonEnd = cleanOutput.lastIndexOf('}');

      if (jsonStart === -1 || jsonEnd === -1) {
        logger.error(`No JSON found in output for ${ticketKey}`);
        return [];
      }

      let jsonStr = cleanOutput.substring(jsonStart, jsonEnd + 1);

      try {
        JSON.parse(jsonStr);
      } catch (e) {
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/\]/g) || []).length;
        const openBraces = (jsonStr.match(/\{/g) || []).length;
        const closeBraces = (jsonStr.match(/\}/g) || []).length;

        while (closeBrackets < openBrackets) jsonStr += ']';
        while (closeBraces < openBraces) jsonStr += '}';

        JSON.parse(jsonStr);
      }

      const parsed = JSON.parse(jsonStr);

      if (!parsed.test_cases || !Array.isArray(parsed.test_cases)) {
        logger.error(`No test_cases array found for ${ticketKey}`);
        return [];
      }

      return parsed.test_cases.map((tc) => ({
        id: tc.id || 'TC000',
        requirement_ref: tc.requirement_ref || 'General',
        title: tc.title || 'Untitled',
        type: ['Positive', 'Negative', 'Boundary', 'Edge', 'Security', 'Performance', 'Usability', 'Compatibility', 'API', 'Integration'].includes(tc.type) ? tc.type : 'Positive',
        priority: ['Critical', 'High', 'Medium', 'Low'].includes(tc.priority) ? tc.priority : 'Medium',
        preconditions: tc.preconditions || 'None',
        steps: Array.isArray(tc.steps) ? tc.steps : [tc.steps || 'No steps'],
        expected_result: tc.expected_result || 'No expected result',
        automation_candidate: tc.automation_candidate !== undefined ? tc.automation_candidate : true,
        status: 'pending_review',
        approved: false,
        rejected: false,
        reviewerNotes: '',
        createdAt: new Date().toISOString()
      }));

    } catch (error) {
      logger.error(`Parse error for ${ticketKey}: ${error.message}`);
      logger.error(`Raw output: ${rawOutput.substring(0, 500)}`);
      return [];
    }
  }

  static deduplicateTestCases(testCases) {
    const seen = new Set();
    return testCases.filter(tc => {
      const key = tc.title.toLowerCase().replace(/\s+/g, ' ').trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  static prioritizeTestCases(testCases) {
    const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    const typeOrder = { 'Positive': 1, 'Negative': 2, 'Boundary': 3, 'Edge': 4, 'Security': 5, 'API': 6, 'Integration': 7, 'Performance': 8, 'Usability': 9 };

    return testCases.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
    });
  }

  static handleGeminiError(error) {
    if (error.status === 429) {
      throw new AppError(
        'Gemini rate limit exceeded (free tier: 5 requests/minute). ' +
        'Please wait 1 minute and retry, or upgrade to paid tier at https://ai.google.dev/pricing', 
        429
      );
    }
    if (error.status === 401 || error.status === 403) {
      throw new AppError('Gemini API key invalid or expired.', 401);
    }
    throw new AppError(`Failed to generate test cases: ${error.message}`, 500);
  }

  static async healthCheck() {
    try {
      const response = await genAI.models.generateContent({
        model: MODEL,
        contents: 'Say "OK"',
        config: { maxOutputTokens: 10 }
      });
      return { status: 'healthy', model: MODEL, available: true };
    } catch (error) {
      return { status: 'unhealthy', model: MODEL, available: false, error: error.message };
    }
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
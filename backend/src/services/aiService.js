import { GoogleGenAI } from '@google/genai';
import logger from '../config/logger.js';
import { AppError } from '../utils/apiResponse.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required. Get one at https://aistudio.google.com/app/apikey');
}

const genAI = new GoogleGenAI({ 
  apiKey: GEMINI_API_KEY,
  httpOptions: { timeout: 300000 }
  
});

// JSON Schema for guaranteed structured output
const TEST_CASE_SCHEMA = {
  type: 'object',
  properties: {
    test_cases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          type: { 
            type: 'string', 
            enum: ['Positive', 'Negative', 'Boundary', 'Edge', 'Security', 'Performance', 'Usability', 'Compatibility']
          },
          priority: { 
            type: 'string', 
            enum: ['Critical', 'High', 'Medium', 'Low']
          },
          preconditions: { type: 'string' },
          steps: { type: 'array', items: { type: 'string' } },
          expected_result: { type: 'string' }
        },
        required: ['id', 'title', 'type', 'priority', 'preconditions', 'steps', 'expected_result']
      }
    }
  },
  required: ['test_cases']
};

export class AIService {
  static async generateTestCases(ticketData) {
    try {
      logger.info(`Generating test cases for ticket: ${ticketData.key}`);

      // Generate in 2 batches to avoid token limits
      const batch1 = await this.generateBatch(ticketData, 1, 'core');
      const batch2 = await this.generateBatch(ticketData, 2, 'extended');

      const allTestCases = [...batch1, ...batch2];

      // Renumber IDs sequentially
      const finalTestCases = allTestCases.map((tc, index) => ({
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
        testCases: finalTestCases
      };

    } catch (error) {
      logger.error(`AI generation failed: ${error.message}`);

      if (error.status === 429) {
        throw new AppError('Gemini rate limit exceeded. Free tier: 1,500 requests/day.', 429);
      }
      if (error.status === 401 || error.status === 403) {
        throw new AppError('Gemini API key invalid or expired.', 401);
      }

      throw new AppError(`Failed to generate test cases: ${error.message}`, 500);
    }
  }

  static async generateBatch(ticketData, batchNum, batchType) {
    const prompt = batchType === 'core' 
      ? this.buildCorePrompt(ticketData)
      : this.buildExtendedPrompt(ticketData);

    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: TEST_CASE_SCHEMA,
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    });

    const rawOutput = response.text;
    return this.parseTestCases(rawOutput, ticketData.key);
  }

  static buildCorePrompt(ticketData) {
    const ac = ticketData.acceptanceCriteria || ticketData.description || 'No acceptance criteria';
    const shortAC = ac.length > 1500 ? ac.substring(0, 1500) + '...' : ac;

    return `Generate 20-25 CORE test cases for this Jira story. Focus on essential functional tests.

TICKET: ${ticketData.key} - ${ticketData.summary}
AC: ${shortAC}

COVERAGE (generate ALL of these):
1. Happy Path / Positive: 8-10 cases (main success scenarios)
2. Negative / Error: 6-8 cases (invalid inputs, errors, unauthorized)
3. Boundary: 4-5 cases (min/max values, empty, special chars)
4. Security: 3-4 cases (auth, injection, privilege)

EACH TEST CASE MUST HAVE:
- id: TC001, TC002, etc.
- title: Specific and actionable
- type: Positive, Negative, Boundary, or Security
- priority: Critical, High, Medium, or Low
- preconditions: Setup needed
- steps: 2-5 numbered steps
- expected_result: Clear pass criteria

Return ONLY JSON in this format:
{"test_cases":[{"id":"TC001","title":"...","type":"Positive","priority":"High","preconditions":"...","steps":["step1","step2"],"expected_result":"..."}]}`;
  }

  static buildExtendedPrompt(ticketData) {
    const ac = ticketData.acceptanceCriteria || ticketData.description || 'No acceptance criteria';
    const shortAC = ac.length > 1500 ? ac.substring(0, 1500) + '...' : ac;

    return `Generate 20-25 EXTENDED test cases for this Jira story. Focus on edge cases, performance, and non-functional tests.

TICKET: ${ticketData.key} - ${ticketData.summary}
AC: ${shortAC}

COVERAGE (generate ALL of these):
1. Edge Cases: 8-10 cases (concurrent ops, race conditions, timeouts, failures)
2. Performance: 5-6 cases (load, response time, memory, scalability)
3. Usability: 4-5 cases (cross-browser, mobile, accessibility, UX)
4. Compatibility: 4-5 cases (different OS, browsers, versions)

EACH TEST CASE MUST HAVE:
- id: TC001, TC002, etc.
- title: Specific and actionable
- type: Edge, Performance, Usability, or Compatibility
- priority: Critical, High, Medium, or Low
- preconditions: Setup needed
- steps: 2-5 numbered steps
- expected_result: Clear pass criteria

Return ONLY JSON in this format:
{"test_cases":[{"id":"TC001","title":"...","type":"Edge","priority":"High","preconditions":"...","steps":["step1","step2"],"expected_result":"..."}]}`;
  }

  static parseTestCases(rawOutput, ticketKey) {
    try {
      let cleanOutput = rawOutput
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      // Find JSON boundaries
      const jsonStart = cleanOutput.indexOf('{');
      const jsonEnd = cleanOutput.lastIndexOf('}');

      if (jsonStart === -1 || jsonEnd === -1) {
        logger.error('No JSON boundaries found in output');
        return [];
      }

      let jsonStr = cleanOutput.substring(jsonStart, jsonEnd + 1);

      // Try to fix truncated JSON
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
        logger.error('No test_cases array found');
        return [];
      }

      return parsed.test_cases.map((tc) => ({
        id: tc.id || 'TC000',
        title: tc.title || 'Untitled',
        type: ['Positive', 'Negative', 'Boundary', 'Edge', 'Security', 'Performance', 'Usability', 'Compatibility'].includes(tc.type) ? tc.type : 'Positive',
        priority: ['Critical', 'High', 'Medium', 'Low'].includes(tc.priority) ? tc.priority : 'Medium',
        preconditions: tc.preconditions || 'None',
        steps: Array.isArray(tc.steps) ? tc.steps : [tc.steps || 'No steps'],
        expected_result: tc.expected_result || 'No expected result',
        status: 'pending_review',
        approved: false,
        rejected: false,
        reviewerNotes: '',
        createdAt: new Date().toISOString()
      }));

    } catch (error) {
      logger.error(`Parse error: ${error.message}`);
      logger.error(`Raw output (first 500 chars): ${rawOutput.substring(0, 500)}`);
      return [];
    }
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
}
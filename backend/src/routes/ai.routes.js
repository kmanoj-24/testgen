import { Router } from 'express';
import { AIService } from '../services/aiService.js';
import { JiraService } from '../services/jiraService.js';
import { AppError } from '../utils/apiResponse.js';
import logger from '../config/logger.js';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    console.log('=== DEBUG: Request body ===', JSON.stringify(req.body, null, 2));

    let ticketData = req.body.ticketData;
    const ticketKey = req.body.ticketKey || req.body.ticketData?.key;

    console.log('=== DEBUG: Extracted ===', {
      hasTicketData: !!ticketData,
      key: ticketData?.key,
      summary: ticketData?.summary?.substring(0, 50),
      acLength: ticketData?.acceptanceCriteria?.length
    });

    if (!ticketData && !ticketKey) {
      throw new AppError('ticketData or ticketKey required', 400);
    }

    if (!ticketData && ticketKey) {
      logger.info(`Fetching ticket ${ticketKey} before generation`);
      ticketData = await JiraService.getTicket(ticketKey);
    }

    if (!ticketData || !ticketData.key) {
      throw new AppError('Invalid ticket data: missing key field', 400);
    }

    req.setTimeout(300000);
    res.setTimeout(300000);

    const result = await AIService.generateTestCases(ticketData);
    
    res.json({ 
      success: true, 
      message: `Generated ${result.testCases.length} test cases`,
      data: result 
    });

  } catch (error) {
    next(error);
  }
});

router.get('/health', async (req, res, next) => {
  try {
    const health = await AIService.healthCheck();
    res.json({ success: true, data: health });
  } catch (error) {
    next(error);
  }
});

export default router;
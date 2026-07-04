import { AIService } from '../services/aiService.js';
import { JiraService } from '../services/jiraService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AIController {
  /**
   * POST /api/ai/generate
   * Generate test cases from a Jira ticket
   */
  static async generateTestCases(req, res, next) {
    try {
      const { ticketKey, ticketData } = req.body || {};

      const ticket = ticketData || await JiraService.getTicket(ticketKey);

      // Generate test cases via AI
      const result = await AIService.generateTestCases(ticket);

      return ApiResponse.success(res, result, 'Test cases generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/health
   * Check AI engine status
   */
  static async healthCheck(req, res, next) {
    try {
      const health = await AIService.healthCheck();
      return ApiResponse.success(res, health, 'AI health check completed');
    } catch (error) {
      next(error);
    }
  }
}
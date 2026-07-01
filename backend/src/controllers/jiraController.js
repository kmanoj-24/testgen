import { JiraService } from '../services/jiraService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class JiraController {
  /**
   * GET /api/jira/ticket/:key
   */
  static async getTicket(req, res, next) {
    try {
      const { key } = req.params;
      const ticket = await JiraService.getTicket(key);
      return ApiResponse.success(res, ticket, 'Ticket fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/jira/project/:key/tickets
   */
  static async getProjectTickets(req, res, next) {
    try {
      const { key } = req.params;
      const { status, priority, search, limit } = req.query;
      
      const tickets = await JiraService.searchTickets(key, {
        status,
        priority,
        search,
        maxResults: parseInt(limit) || 50
      });
      
      return ApiResponse.success(res, {
        project: key,
        count: tickets.length,
        tickets
      }, 'Tickets fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/jira/project/:key
   */
  static async getProject(req, res, next) {
    try {
      const { key } = req.params;
      const project = await JiraService.getProject(key);
      return ApiResponse.success(res, project, 'Project fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
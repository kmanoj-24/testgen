import { jiraClient } from '../config/jira.js';
import { ADFParser } from './adfParser.js';
import { AppError } from '../utils/apiResponse.js';
import logger from '../config/logger.js';

export class JiraService {
  /**
   * Fetch a single Jira ticket with parsed acceptance criteria
   */
  static async getTicket(issueKey) {
    try {
      logger.info(`Fetching Jira ticket: ${issueKey}`);
      
      const response = await jiraClient.get(`/issue/${issueKey}`, {
        params: {
          fields: 'summary,description,status,priority,assignee,issuetype,created,updated,labels,components,customfield_10014,customfield_10020'
        }
      });

      const { fields } = response.data;
      
      // Parse description
      const rawDescription = fields.description 
        ? ADFParser.parse(fields.description) 
        : '';
      
      // Extract acceptance criteria
      const acceptanceCriteria = ADFParser.extractAcceptanceCriteria(rawDescription);
      
      // Try custom field for AC if not found in description
      const customAC = fields.customfield_10014 || fields.customfield_10020;
      const finalAC = acceptanceCriteria || (customAC ? ADFParser.parse(customAC) : null);

      const ticket = {
        key: response.data.key,
        summary: fields.summary,
        description: rawDescription,
        acceptanceCriteria: finalAC,
        status: {
          name: fields.status?.name,
          color: fields.status?.statusCategory?.colorName
        },
        priority: {
          name: fields.priority?.name,
          icon: fields.priority?.iconUrl
        },
        assignee: fields.assignee ? {
          name: fields.assignee.displayName,
          email: fields.assignee.emailAddress,
          avatar: fields.assignee.avatarUrls?.['48x48']
        } : null,
        issueType: fields.issuetype?.name,
        labels: fields.labels || [],
        components: fields.components?.map(c => c.name) || [],
        created: fields.created,
        updated: fields.updated,
        url: `${process.env.JIRA_BASE_URL}/browse/${issueKey}`
      };

      logger.info(`Successfully fetched ticket: ${issueKey}`);
      return ticket;

    } catch (error) {
      if (error.response?.status === 404) {
        throw new AppError(`Ticket ${issueKey} not found`, 404);
      }
      if (error.response?.status === 401) {
        throw new AppError('Jira authentication failed. Check your API token.', 401);
      }
      logger.error(`Jira API error: ${error.message}`);
      throw new AppError(`Failed to fetch ticket: ${error.message}`, 500);
    }
  }

  /**
   * Search tickets in a project with filters
   */
  static async searchTickets(projectKey, filters = {}) {
    try {
      const { status, priority, search, maxResults = 50 } = filters;
      
      let jql = `project = ${projectKey}`;
      
      if (status) {
        jql += ` AND status = "${status}"`;
      }
      if (priority) {
        jql += ` AND priority = "${priority}"`;
      }
      if (search) {
        jql += ` AND (summary ~ "${search}" OR description ~ "${search}")`;
      }
      
      jql += ' ORDER BY updated DESC';

      logger.info(`JQL Query: ${jql}`);

      const response = await jiraClient.post('/search', {
        jql,
        maxResults,
        fields: ['summary', 'status', 'priority', 'assignee', 'issuetype', 'updated', 'labels']
      });

      return response.data.issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status?.name,
        priority: issue.fields.priority?.name,
        issueType: issue.fields.issuetype?.name,
        assignee: issue.fields.assignee?.displayName || 'Unassigned',
        updated: issue.fields.updated,
        labels: issue.fields.labels || []
      }));

    } catch (error) {
      logger.error(`Jira search error: ${error.message}`);
      throw new AppError(`Failed to search tickets: ${error.message}`, 500);
    }
  }

  /**
   * Get project metadata
   */
  static async getProject(projectKey) {
    try {
      const response = await jiraClient.get(`/project/${projectKey}`);
      return {
        key: response.data.key,
        name: response.data.name,
        description: response.data.description,
        lead: response.data.lead?.displayName,
        url: response.data.self
      };
    } catch (error) {
      throw new AppError(`Project ${projectKey} not found`, 404);
    }
  }
}
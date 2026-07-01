import axios from 'axios';

const jiraConfig = {
  baseURL: process.env.JIRA_BASE_URL,
  email: process.env.JIRA_EMAIL,
  apiToken: process.env.JIRA_API_TOKEN,
  projectKey: process.env.JIRA_PROJECT_KEY,
  timeout: 10000,
  maxRetries: 3
};

// Validate config on load
const required = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required Jira config: ${missing.join(', ')}`);
}

const jiraClient = axios.create({
  baseURL: `${jiraConfig.baseURL}/rest/api/3`,
  timeout: jiraConfig.timeout,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  auth: {
    username: jiraConfig.email,
    password: jiraConfig.apiToken
  }
});

// Add retry logic
jiraClient.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;
    if (!config || !config.retry) {
      config.retry = 0;
    }
    
    if (config.retry < jiraConfig.maxRetries && 
        (response?.status === 429 || response?.status >= 500)) {
      config.retry += 1;
      const delay = Math.pow(2, config.retry) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return jiraClient(config);
    }
    
    return Promise.reject(error);
  }
);

export { jiraClient, jiraConfig };
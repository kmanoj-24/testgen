import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 60 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    console.error(`❌ API Error: ${message}`);
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export const jiraApi = {
  getTicket: (key) => api.get(`/jira/ticket/${key}`),
  getProject: (key) => api.get(`/jira/project/${key}`),
  getProjectTickets: (key, params) => api.get(`/jira/project/${key}/tickets`, { params })
};

export const aiApi = {
  generateTestCases: (ticketKey) => api.post('/ai/generate', { ticketKey }),
  healthCheck: () => api.get('/ai/health')
};

export default api;
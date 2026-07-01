import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cors from './middleware/cors.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import logger from './config/logger.js';

const app = express();

// CORS must come BEFORE helmet so helmet doesn't strip the headers
app.use(cors);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Root health check (for Docker)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Success',
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TestGen AI API is running',
    endpoints: {
      health: '/health',
      api: '/api',
      jiraTicket: '/api/jira/ticket/:key',
      jiraProject: '/api/jira/project/:key'
    }
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
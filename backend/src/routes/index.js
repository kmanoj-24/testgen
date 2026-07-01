import { Router } from 'express';
import jiraRoutes from './jira.routes.js';
import aiRoutes from './ai.routes.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  ApiResponse.success(res, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/jira', jiraRoutes);
router.use('/ai', aiRoutes);

export default router;
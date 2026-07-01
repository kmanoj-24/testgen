import { z } from 'zod';
import { AppError } from '../utils/apiResponse.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error) {
    const message = error.errors?.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new AppError(message || 'Validation failed', 400);
  }
};

// Common schemas
export const schemas = {
  ticketKey: z.object({
    params: z.object({
      key: z.string().regex(/^[A-Z]+-\d+$/, 'Invalid Jira ticket key format (e.g., PROJ-123)')
    })
  }),
  
  projectKey: z.object({
    params: z.object({
      key: z.string().regex(/^[A-Z]+$/, 'Invalid project key format')
    })
  })
};
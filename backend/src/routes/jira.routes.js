import { Router } from 'express';
import { JiraController } from '../controllers/jiraController.js';
import { validate, schemas } from '../middleware/requestValidator.js';

const router = Router();

router.get('/ticket/:key', validate(schemas.ticketKey), JiraController.getTicket);
router.get('/project/:key', validate(schemas.projectKey), JiraController.getProject);
router.get('/project/:key/tickets', validate(schemas.projectKey), JiraController.getProjectTickets);

export default router;
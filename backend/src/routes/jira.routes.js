import { Router } from 'express';
import { JiraController } from '../controllers/jiraController.js';
import { validate, schemas } from '../middleware/requestValidator.js';

const router = Router();

router.get('/ticket/:key', validate(schemas.ticketKey), JiraController.getTicket);
router.get('/project/:key', validate(schemas.projectKey), JiraController.getProject);
router.get('/project/:key/tickets', validate(schemas.projectKey), JiraController.getProjectTickets);
// Add this route to debug AC extraction
router.get('/ticket/:key/debug', async (req, res, next) => {
  try {
    const ticket = await JiraService.getTicket(req.params.key);
    
    res.json({
      success: true,
      data: {
        key: ticket.key,
        summary: ticket.summary,
        acceptanceCriteria: ticket.acceptanceCriteria,
        descriptionLength: ticket.description?.length,
        descriptionPreview: ticket.description?.substring(0, 500),
        acLength: ticket.acceptanceCriteria?.length,
        hasMeaningfulAC: ticket.acceptanceCriteria && ticket.acceptanceCriteria.length > 50
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';

const router = Router();

router.post('/generate', AIController.generateTestCases);
router.get('/health', AIController.healthCheck);

export default router;
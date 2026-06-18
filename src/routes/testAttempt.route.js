import express from 'express';
import testAttemptController from '../controllers/testAttempt.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get(
  '/:id',
  protectRoute,
  requireRole(['STUDENT']),
  testAttemptController.getAttempt,
);
router.post(
  '/:id/answers',
  protectRoute,
  requireRole(['STUDENT']),
  testAttemptController.saveAnswer,
);
router.post(
  '/:id/submit',
  protectRoute,
  requireRole(['STUDENT']),
  testAttemptController.submitAttempt,
);
router.get(
  '/:id/result',
  protectRoute,
  requireRole(['STUDENT']),
  testAttemptController.getResult,
);

export default router;

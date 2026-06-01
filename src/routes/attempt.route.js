import express from 'express';
import attemptController from '../controllers/quizAttempt.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get(
  '/:id',
  protectRoute,
  requireRole(['STUDENT']),
  attemptController.getAttempt,
);

router.post(
  '/:id/answers',
  protectRoute,
  requireRole(['STUDENT']),
  attemptController.saveAnswer,
);

router.post(
  '/:id/submit',
  protectRoute,
  requireRole(['STUDENT']),
  attemptController.submitAttempt,
);

router.get(
  '/:id/result',
  protectRoute,
  requireRole(['STUDENT']),
  attemptController.getResult,
);

export default router;

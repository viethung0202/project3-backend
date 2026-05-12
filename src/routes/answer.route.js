import express from 'express';
import answerController from '../controllers/answer.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  answerController.updateAnswer,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  answerController.deleteAnswer,
);

export default router;

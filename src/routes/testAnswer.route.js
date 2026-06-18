import express from 'express';
import testAnswerController from '../controllers/testAnswer.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testAnswerController.updateAnswer,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testAnswerController.deleteAnswer,
);

export default router;

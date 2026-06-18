import express from 'express';
import testQuestionController from '../controllers/testQuestion.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';
import { uploadQuestionMedia } from '../middlewares/upload.js';

const router = express.Router();

router.post(
  '/:id/answers',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testQuestionController.createAnswer,
);
router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  uploadQuestionMedia.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  testQuestionController.updateQuestion,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testQuestionController.deleteQuestion,
);

export default router;

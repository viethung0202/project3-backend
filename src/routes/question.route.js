import express from 'express';
import answerController from '../controllers/answer.controller.js';
import questionController from '../controllers/question.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';
import { uploadQuestionMedia } from '../middlewares/upload.js';

const router = express.Router();

router.post(
  '/:questionId/answers',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  answerController.createAnswer,
);
router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  uploadQuestionMedia.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  questionController.updateQuestion,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  questionController.deleteQuestion,
);

export default router;

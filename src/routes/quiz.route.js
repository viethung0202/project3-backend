import express from 'express';
import questionController from '../controllers/question.controller.js';
import quizController from '../controllers/quiz.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.post(
  '/:quizId/questions',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  questionController.createQuestion,
);
router.get('/:id', quizController.getQuizById);
router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  quizController.updateQuiz,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  quizController.deleteQuiz,
);

export default router;

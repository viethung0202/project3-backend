import express from 'express';
import flashcardController from '../controllers/flashcard.controller.js';
import lessonController from '../controllers/lesson.controller.js';
import moduleController from '../controllers/module.controller.js';
import quizController from '../controllers/quiz.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.put(
  '/reorder',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  moduleController.reorderModules,
);
router.get('/:moduleId/lessons', lessonController.getLessonsByModuleId);
router.post(
  '/:moduleId/lessons',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  lessonController.createLesson,
);
router.get('/:moduleId/quizzes', quizController.getQuizzesByModuleId);
router.post(
  '/:moduleId/quizzes',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  quizController.createQuiz,
);
router.get(
  '/:moduleId/flashcard-sets',
  flashcardController.getFlashcardSetsByModuleId,
);
router.post(
  '/:moduleId/flashcard-sets',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  flashcardController.createFlashcardSet,
);
router.get('/:id', moduleController.getModuleById);
router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  moduleController.updateModule,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  moduleController.deleteModule,
);

export default router;

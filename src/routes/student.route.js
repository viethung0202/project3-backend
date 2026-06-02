import express from 'express';
import studentController from '../controllers/student.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get(
  '/stats',
  protectRoute,
  requireRole(['STUDENT']),
  studentController.getStats,
);
router.get(
  '/courses',
  protectRoute,
  requireRole(['STUDENT']),
  studentController.getMyCourses,
);
router.get(
  '/quiz-history',
  protectRoute,
  requireRole(['STUDENT']),
  studentController.getQuizHistory,
);
router.get(
  '/progress',
  protectRoute,
  requireRole(['STUDENT']),
  studentController.getProgress,
);
router.get(
  '/courses/:courseId/completed-lessons',
  protectRoute,
  requireRole(['STUDENT']),
  studentController.getCompletedLessons,
);

export default router;

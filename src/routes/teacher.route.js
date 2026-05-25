import express from 'express';
import teacherController from '../controllers/teacher.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get(
  '/stats',
  protectRoute,
  requireRole(['TEACHER']),
  teacherController.getStats,
);
router.get(
  '/courses',
  protectRoute,
  requireRole(['TEACHER']),
  teacherController.getMyCourses,
);
router.get(
  '/courses/:courseId/enrollments',
  protectRoute,
  requireRole(['TEACHER']),
  teacherController.getCourseEnrollments,
);

export default router;

import express from 'express';
import courseController from '../controllers/course.controller.js';
import moduleController from '../controllers/module.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.post(
  '/',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  courseController.createCourse,
);
router.get('/', courseController.getAllCourses);
router.get('/:courseId/modules', moduleController.getModulesByCourseId);
router.post(
  '/:courseId/modules',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  moduleController.createModule,
);
router.get('/:id', courseController.getCourseById);
router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  courseController.updateCourse,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  courseController.deleteCourse,
);
router.put(
  '/:id/publish',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  courseController.publishCourse,
);
router.post(
  '/:id/teachers',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  courseController.addTeacherToCourse,
);
router.delete(
  '/:id/teachers/:userId',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  courseController.removeTeacherFromCourse,
);
router.get(
  '/:id/teachers',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  courseController.getCourseTeachers,
);

export default router;

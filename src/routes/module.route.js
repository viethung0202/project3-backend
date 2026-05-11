import express from 'express';
import lessonController from '../controllers/lesson.controller.js';
import moduleController from '../controllers/module.controller.js';
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

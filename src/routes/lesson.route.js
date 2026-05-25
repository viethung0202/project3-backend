import express from 'express';
import lessonController from '../controllers/lesson.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';
import { uploadVideo } from '../middlewares/upload.js';

const router = express.Router();

router.get('/:id', lessonController.getLessonById);
router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  uploadVideo.fields([
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  lessonController.updateLesson,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  lessonController.deleteLesson,
);

export default router;

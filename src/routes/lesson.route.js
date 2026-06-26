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

// Student đánh dấu hoàn thành lesson
router.post(
  '/:id/complete',
  protectRoute,
  requireRole(['STUDENT']),
  lessonController.markComplete,
);
router.delete(
  '/:id/complete',
  protectRoute,
  requireRole(['STUDENT']),
  lessonController.unmarkComplete,
);

// Lesson documents — academic gắn / gỡ / đổi thứ tự
router.post(
  '/:id/documents',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  lessonController.attachDocument,
);
router.delete(
  '/:id/documents/:documentId',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  lessonController.detachDocument,
);
router.put(
  '/:id/documents/order',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  lessonController.reorderDocuments,
);

export default router;

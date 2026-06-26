import express from 'express';
import documentController from '../controllers/document.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';
import { uploadDocument } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', protectRoute, documentController.list);
router.get('/:id', protectRoute, documentController.getById);

router.post(
  '/',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  uploadDocument.single('file'),
  documentController.create,
);
router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  uploadDocument.single('file'),
  documentController.update,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  documentController.remove,
);

// Student đánh giá (rating sao + comment)
router.post(
  '/:id/reviews',
  protectRoute,
  requireRole(['STUDENT']),
  documentController.upsertReview,
);
router.delete(
  '/:id/reviews/me',
  protectRoute,
  requireRole(['STUDENT']),
  documentController.deleteReview,
);

// Teacher góp ý nội dung (chỉ text)
router.post(
  '/:id/feedbacks',
  protectRoute,
  requireRole(['TEACHER']),
  documentController.upsertFeedback,
);
router.delete(
  '/:id/feedbacks/me',
  protectRoute,
  requireRole(['TEACHER']),
  documentController.deleteFeedback,
);

export default router;

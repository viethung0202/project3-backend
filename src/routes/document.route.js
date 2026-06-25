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

// Teacher đánh giá
router.post(
  '/:id/reviews',
  protectRoute,
  requireRole(['TEACHER']),
  documentController.upsertReview,
);
router.delete(
  '/:id/reviews/me',
  protectRoute,
  requireRole(['TEACHER']),
  documentController.deleteReview,
);

export default router;

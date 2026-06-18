import express from 'express';
import testPartController from '../controllers/testPart.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';
import { uploadQuestionMedia } from '../middlewares/upload.js';

const router = express.Router();

router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testPartController.updatePart,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testPartController.deletePart,
);
router.post(
  '/:id/passages',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  uploadQuestionMedia.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  testPartController.createPassage,
);
router.post(
  '/:id/questions',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  uploadQuestionMedia.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  testPartController.createQuestion,
);

export default router;

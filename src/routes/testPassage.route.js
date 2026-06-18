import express from 'express';
import testPassageController from '../controllers/testPassage.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';
import { uploadQuestionMedia } from '../middlewares/upload.js';

const router = express.Router();

router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  uploadQuestionMedia.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  testPassageController.updatePassage,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testPassageController.deletePassage,
);

export default router;

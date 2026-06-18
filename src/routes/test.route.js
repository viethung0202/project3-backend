import express from 'express';
import testController from '../controllers/test.controller.js';
import testAttemptController from '../controllers/testAttempt.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get('/', testController.getAllTests);
router.post(
  '/',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testController.createTest,
);
router.get('/:id/preview', testController.getTestPreviewById);
router.post(
  '/:id/parts',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testController.createPart,
);
router.post(
  '/:id/attempts',
  protectRoute,
  requireRole(['STUDENT']),
  testAttemptController.startAttempt,
);
router.get(
  '/:id/my-attempts',
  protectRoute,
  requireRole(['STUDENT']),
  testAttemptController.getMyAttempts,
);
router.get(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testController.getTestById,
);
router.put(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testController.updateTest,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testController.deleteTest,
);
router.put(
  '/:id/publish',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  testController.publishTest,
);

export default router;

import express from 'express';
import evaluationController from '../controllers/evaluation.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

// Teacher
router.post(
  '/',
  protectRoute,
  requireRole(['TEACHER']),
  evaluationController.upsert,
);
router.get(
  '/course/:courseId',
  protectRoute,
  requireRole(['TEACHER']),
  evaluationController.listForCourse,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['TEACHER']),
  evaluationController.remove,
);

// Student
router.get(
  '/me',
  protectRoute,
  requireRole(['STUDENT']),
  evaluationController.listMine,
);
router.get(
  '/me/course/:courseId',
  protectRoute,
  requireRole(['STUDENT']),
  evaluationController.getMineForCourse,
);

export default router;

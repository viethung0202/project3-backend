import express from 'express';
import academicController from '../controllers/academic.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get(
  '/stats',
  protectRoute,
  requireRole(['ADMIN', 'ACADEMIC_STAFF']),
  academicController.getStats,
);

export default router;

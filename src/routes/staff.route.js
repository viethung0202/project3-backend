import express from 'express';
import staffController from '../controllers/staff.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get(
  '/stats',
  protectRoute,
  requireRole(['ADMIN', 'ADMIN_STAFF']),
  staffController.getStats,
);

export default router;

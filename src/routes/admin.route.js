import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get(
  '/stats',
  protectRoute,
  requireRole(['ADMIN']),
  adminController.getStats,
);

export default router;

import express from 'express';
import contactController from '../controllers/contact.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

// Public — submit form
router.post('/', contactController.createMessage);

// Admin — quản lý tin nhắn
router.get(
  '/',
  protectRoute,
  requireRole(['ADMIN']),
  contactController.listMessages,
);
router.get(
  '/stats',
  protectRoute,
  requireRole(['ADMIN']),
  contactController.getStats,
);
router.patch(
  '/:id/status',
  protectRoute,
  requireRole(['ADMIN']),
  contactController.updateStatus,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ADMIN']),
  contactController.deleteMessage,
);

export default router;

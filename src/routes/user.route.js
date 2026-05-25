import express from 'express';
import userController from '../controllers/user.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get(
  '/',
  protectRoute,
  requireRole(['ADMIN', 'ADMIN_STAFF', 'ACADEMIC_STAFF']),
  userController.getAllUsers,
);
router.post(
  '/',
  protectRoute,
  requireRole(['ADMIN', 'ADMIN_STAFF']),
  userController.createUser,
);
router.get(
  '/:id',
  protectRoute,
  requireRole(['ADMIN', 'ADMIN_STAFF', 'ACADEMIC_STAFF']),
  userController.getUserById,
);
router.put(
  '/:id',
  protectRoute,
  requireRole(['ADMIN', 'ADMIN_STAFF']),
  upload.single('avatar'),
  userController.updateUser,
);
router.put(
  '/:id/toggle-active',
  protectRoute,
  requireRole(['ADMIN', 'ADMIN_STAFF']),
  userController.toggleUserActive,
);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ADMIN', 'ADMIN_STAFF']),
  userController.deleteUser,
);

export default router;

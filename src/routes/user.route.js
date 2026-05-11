import express from 'express';
import userController from '../controllers/user.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get(
  '/',
  protectRoute,
  requireRole(['ADMIN', 'ADMIN_STAFF']),
  userController.getAllUsers,
);
router.get('/:id', protectRoute, userController.getUserById);
router.put('/:id', protectRoute, userController.updateUser);
router.delete(
  '/:id',
  protectRoute,
  requireRole(['ADMIN', 'ADMIN_STAFF']),
  userController.deleteUser,
);

export default router;

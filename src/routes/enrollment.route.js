import express from 'express';
import enrollmentController from '../controllers/enrollment.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

const staffRoles = ['ADMIN', 'ADMIN_STAFF'];

router.get('/', protectRoute, requireRole(staffRoles), enrollmentController.list);
router.post('/', protectRoute, requireRole(staffRoles), enrollmentController.create);
router.delete(
  '/:id',
  protectRoute,
  requireRole(staffRoles),
  enrollmentController.remove,
);

export default router;

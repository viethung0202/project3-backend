import express from 'express';
import enrollmentController from '../controllers/enrollment.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

const staffRoles = ['ADMIN', 'ADMIN_STAFF'];

router.get('/', protectRoute, requireRole(staffRoles), enrollmentController.list);
// STUDENT cũng tạo enrollment được (tự đăng ký), backend forces studentId = req.user.id
router.post(
  '/',
  protectRoute,
  requireRole([...staffRoles, 'STUDENT']),
  enrollmentController.create,
);
// STUDENT có thể tự hủy đăng ký của mình
router.delete(
  '/:id',
  protectRoute,
  requireRole([...staffRoles, 'STUDENT']),
  enrollmentController.remove,
);

export default router;

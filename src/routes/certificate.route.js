import express from 'express';
import certificateController from '../controllers/certificate.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

// Public — verify chứng chỉ
router.get('/verify/:certNumber', certificateController.verify);

// Public — xem chứng chỉ (để render trang certificate share được)
router.get('/by-number/:certNumber', certificateController.getByCertNumber);

// Student — claim + xem chứng chỉ của mình
router.post('/claim', protectRoute, certificateController.claim);
router.get('/me', protectRoute, certificateController.listMine);

// Admin — quản lý tất cả
router.get(
  '/',
  protectRoute,
  requireRole(['ADMIN']),
  certificateController.listAll,
);
router.patch(
  '/:id/revoke',
  protectRoute,
  requireRole(['ADMIN']),
  certificateController.revoke,
);

export default router;

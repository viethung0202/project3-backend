// src/routes/auth.route.js
import express from 'express';
import authController from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protectRoute, authController.tetsLogin);
router.put(
  '/me',
  protectRoute,
  upload.single('avatar'),
  authController.updateProfile,
);
router.post('/logout', authController.logout);
router.post('/change-password', protectRoute, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.get('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

export default router;

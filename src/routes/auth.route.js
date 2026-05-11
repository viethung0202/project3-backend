// src/routes/auth.route.js
import express from 'express';
import authController from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protectRoute, authController.tetsLogin);
router.post('/logout', authController.logout);

export default router;

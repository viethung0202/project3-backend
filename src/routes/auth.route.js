// src/routes/auth.route.js
import express from 'express';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;

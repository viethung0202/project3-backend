import express from 'express';
import leaderboardController from '../controllers/leaderboard.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

router.get(
  '/course/:courseId',
  protectRoute,
  leaderboardController.getLeaderboard,
);

export default router;

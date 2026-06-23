import leaderboardService from '../services/leaderboard.service.js';

const getLeaderboard = async (req, res) => {
  try {
    const data = await leaderboardService.computeLeaderboard(
      req.user.id,
      req.user.role,
      req.params.courseId,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export default { getLeaderboard };

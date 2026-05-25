import staffService from '../services/staff.service.js';

const getStats = async (req, res) => {
  try {
    const stats = await staffService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get stats',
    });
  }
};

export default { getStats };

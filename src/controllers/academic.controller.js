import academicService from '../services/academic.service.js';

const getStats = async (req, res) => {
  try {
    const stats = await academicService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get stats',
    });
  }
};

export default { getStats };

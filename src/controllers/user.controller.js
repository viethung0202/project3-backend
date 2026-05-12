import userService from '../services/user.service.js';
import cloudinaryService from '../configs/cloudinary.js';

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get users',
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to get user',
    });
  }
};

const updateUser = async (req, res) => {
  try {
    if (req.file) {
      req.body.avatar = await cloudinaryService.uploadImage(req.file);
    }

    const user = await userService.updateUser(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

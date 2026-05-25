import userService from '../services/user.service.js';
import cloudinaryService from '../configs/cloudinary.js';

const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const users = await userService.getAllUsers({ role, search });

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

    // ADMIN_STAFF không được đổi role / isActive / password của user khác
    if (req.user.role === 'ADMIN_STAFF') {
      delete req.body.role;
      delete req.body.isActive;
      delete req.body.password;
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

const createUser = async (req, res) => {
  try {
    // ADMIN_STAFF chỉ được tạo TEACHER hoặc STUDENT
    if (req.user.role === 'ADMIN_STAFF') {
      if (!['TEACHER', 'STUDENT'].includes(req.body.role)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn chỉ có quyền tạo tài khoản Giáo viên hoặc Học sinh',
        });
      }
    }

    const user = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Tạo người dùng thất bại',
    });
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const user = await userService.toggleUserActive(req.params.id);
    res.status(200).json({
      success: true,
      message: user.isActive ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản',
      data: user,
    });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Thao tác thất bại',
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
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
};

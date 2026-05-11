// src/controllers/auth.controller.js
import authService from '../services/auth.service.js';

const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Gọi service
    const user = await authService.register({
      fullName,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Đăng ký thất bại',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.login(email, password);

    // ==================== LƯU TOKEN VÀO COOKIE ====================
    res.cookie('token', token, {
      httpOnly: true, // Không cho JavaScript truy cập (an toàn hơn)
      secure: process.env.NODE_ENV === 'production', // Chỉ dùng HTTPS ở production
      sameSite: 'strict', // Bảo vệ CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (phải khớp với JWT expiresIn)
    });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user,
        // Không trả token trong body nữa (vì đã lưu vào cookie)
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Đăng nhập thất bại',
    });
  }
};

const tetsLogin = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ success: true, message: 'Logout successful' });
};

export default {
  register,
  login,
  tetsLogin,
  logout,
};

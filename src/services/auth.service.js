// src/services/auth.service.js
import prisma from '../configs/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const register = async (userData) => {
  const { fullName, email, password, role = 'STUDENT' } = userData;

  if (!fullName || !email || !password) {
    throw new Error('Vui lòng nhập đầy đủ họ tên, email và mật khẩu');
  }
  if (password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }

  // Kiểm tra email đã tồn tại chưa
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email đã được sử dụng');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Tạo user mới
  const newUser = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return newUser;
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      password: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  // Tạo JWT Token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );

  const { password: _password, ...userInfo } = user;

  return {
    user: userInfo,
    token, // vẫn trả token về để frontend có thể lưu nếu cần
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới');
  }
  if (newPassword.length < 6) {
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
  }
  if (currentPassword === newPassword) {
    throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentValid) {
    throw new Error('Mật khẩu hiện tại không đúng');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Đổi mật khẩu thành công' };
};

const updateProfile = async (userId, profileData) => {
  const { fullName, phone, avatar } = profileData;

  if (fullName !== undefined && fullName.trim().length < 2) {
    throw new Error('Họ tên phải có ít nhất 2 ký tự');
  }

  const data = {};
  if (fullName !== undefined) data.fullName = fullName.trim();
  if (phone !== undefined) data.phone = phone || null;
  if (avatar !== undefined && avatar !== '') data.avatar = avatar;

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatar: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export default {
  register,
  login,
  changePassword,
  updateProfile,
};

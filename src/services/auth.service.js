// src/services/auth.service.js
import prisma from '../configs/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mailer from '../configs/mailer.js';

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

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 giờ

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const forgotPassword = async (email) => {
  if (!email?.trim()) throw new Error('Vui lòng nhập email');

  const user = await prisma.user.findUnique({
    where: { email: email.trim() },
    select: { id: true, email: true, fullName: true, isActive: true },
  });

  // Luôn trả success để không tiết lộ email tồn tại hay không
  if (!user || !user.isActive) {
    return { sent: false };
  }

  // Vô hiệu hóa token cũ chưa dùng của user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  // Sinh token thô + lưu hash
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

  mailer
    .sendPasswordReset({
      to: user.email,
      fullName: user.fullName,
      resetUrl,
      expiresInMinutes: RESET_TOKEN_TTL_MS / 60000,
    })
    .catch((err) =>
      console.error('[auth] Gửi email reset thất bại:', err.message),
    );

  return { sent: true };
};

const resetPassword = async (rawToken, newPassword) => {
  if (!rawToken) throw new Error('Token không hợp lệ');
  if (!newPassword) throw new Error('Vui lòng nhập mật khẩu mới');
  if (newPassword.length < 6)
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');

  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, isActive: true } } },
  });

  if (!record || !record.user || !record.user.isActive) {
    throw new Error('Token không hợp lệ hoặc đã được sử dụng');
  }
  if (record.usedAt) {
    throw new Error('Token đã được sử dụng');
  }
  if (record.expiresAt < new Date()) {
    throw new Error('Token đã hết hạn, vui lòng yêu cầu lại');
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Xóa hết token còn lại của user
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, usedAt: null },
    }),
  ]);

  return { message: 'Đặt lại mật khẩu thành công' };
};

const verifyResetToken = async (rawToken) => {
  if (!rawToken) return { valid: false };
  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { expiresAt: true, usedAt: true },
  });
  if (!record) return { valid: false };
  if (record.usedAt) return { valid: false, reason: 'used' };
  if (record.expiresAt < new Date()) return { valid: false, reason: 'expired' };
  return { valid: true };
};

export default {
  register,
  login,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyResetToken,
};

import prisma from '../configs/index.js';
import bcrypt from 'bcryptjs';

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  avatar: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const VALID_ROLES = ['ADMIN', 'ACADEMIC_STAFF', 'ADMIN_STAFF', 'TEACHER', 'STUDENT'];

const createUser = async (userData) => {
  const { fullName, email, password, role, phone } = userData;

  if (!fullName || !email || !password || !role) {
    throw new Error('Vui lòng nhập đầy đủ họ tên, email, mật khẩu và vai trò');
  }
  if (password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }
  if (!VALID_ROLES.includes(role)) {
    throw new Error('Vai trò không hợp lệ');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email đã được sử dụng');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      role,
      phone: phone || null,
    },
    select: userSelect,
  });
};

const toggleUserActive = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });
  if (!user) throw new Error('User not found');

  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: userSelect,
  });
};

const getAllUsers = async ({ role, search } = {}) => {
  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: { createdAt: 'desc' },
  });
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const updateUser = async (id, userData) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  const { fullName, phone, avatar, role, isActive, password } = userData;

  const data = {};

  if (fullName !== undefined) data.fullName = fullName;
  if (phone !== undefined) data.phone = phone;
  if (avatar !== undefined) data.avatar = avatar;
  if (role !== undefined) data.role = role;
  if (isActive !== undefined) data.isActive = isActive;

  if (password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(password, salt);
  }

  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
};

const deleteUser = async (id) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  await prisma.user.delete({
    where: { id },
  });

  return { message: 'User deleted successfully' };
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
};

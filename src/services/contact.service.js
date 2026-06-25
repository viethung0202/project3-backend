import prisma from '../configs/index.js';
import mailer from '../configs/mailer.js';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createMessage = async ({ fullName, email, phone, subject, message }) => {
  if (!fullName?.trim()) throw new Error('Vui lòng nhập họ tên');
  if (!email?.trim()) throw new Error('Vui lòng nhập email');
  if (!EMAIL_RX.test(email.trim())) throw new Error('Email không hợp lệ');
  if (!message?.trim()) throw new Error('Vui lòng nhập nội dung');
  if (message.trim().length > 5000) throw new Error('Nội dung quá dài');

  const created = await prisma.contactMessage.create({
    data: {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      subject: subject?.trim() || null,
      message: message.trim(),
    },
  });

  mailer.sendContactNotification(created).catch((err) => {
    console.error('[contact] Gửi email thất bại:', err.message);
  });

  return created;
};

const listMessages = async ({ status, page = 1, pageSize = 20 } = {}) => {
  const where = status ? { status } : {};
  const skip = (Math.max(1, Number(page)) - 1) * Number(pageSize);
  const take = Math.min(100, Math.max(1, Number(pageSize)));

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return { items, total, page: Number(page), pageSize: take };
};

const updateStatus = async (id, status) => {
  const valid = ['NEW', 'IN_PROGRESS', 'RESOLVED'];
  if (!valid.includes(status)) throw new Error('Trạng thái không hợp lệ');

  return prisma.contactMessage.update({
    where: { id },
    data: { status },
  });
};

const deleteMessage = async (id) => {
  return prisma.contactMessage.delete({ where: { id } });
};

const getStats = async () => {
  const [total, newCount, inProgress, resolved] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: 'NEW' } }),
    prisma.contactMessage.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.contactMessage.count({ where: { status: 'RESOLVED' } }),
  ]);
  return { total, newCount, inProgress, resolved };
};

export default {
  createMessage,
  listMessages,
  updateStatus,
  deleteMessage,
  getStats,
};

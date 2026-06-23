import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn('[mailer] MAIL_USER / MAIL_PASS chưa cấu hình, bỏ qua gửi email');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  return transporter;
};

const sendContactNotification = async (msg) => {
  const t = getTransporter();
  if (!t) return false;

  const to = process.env.MAIL_ADMIN || process.env.MAIL_USER;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0;">📬 Tin nhắn liên hệ mới</h2>
        <p style="color: #dbeafe; margin: 4px 0 0 0;">EngCenter Contact Form</p>
      </div>
      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Họ tên:</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(msg.fullName)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a></td></tr>
          ${msg.phone ? `<tr><td style="padding: 8px 0; color: #6b7280;">SĐT:</td><td style="padding: 8px 0;">${escapeHtml(msg.phone)}</td></tr>` : ''}
          ${msg.subject ? `<tr><td style="padding: 8px 0; color: #6b7280;">Chủ đề:</td><td style="padding: 8px 0;">${escapeHtml(msg.subject)}</td></tr>` : ''}
        </table>
        <div style="margin-top: 16px; padding: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 6px;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">Nội dung:</p>
          <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(msg.message)}</p>
        </div>
        <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">Gửi lúc: ${new Date(msg.createdAt).toLocaleString('vi-VN')}</p>
      </div>
    </div>
  `;

  try {
    await t.sendMail({
      from: `"EngCenter" <${process.env.MAIL_USER}>`,
      to,
      replyTo: msg.email,
      subject: `[EngCenter] Tin nhắn mới từ ${msg.fullName}`,
      html,
    });
    return true;
  } catch (err) {
    console.error('[mailer] Gửi email thất bại:', err.message);
    return false;
  }
};

const sendPasswordReset = async ({ to, fullName, resetUrl, expiresInMinutes }) => {
  const t = getTransporter();
  if (!t) return false;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0;">🔐 Đặt lại mật khẩu</h2>
        <p style="color: #dbeafe; margin: 4px 0 0 0;">EngCenter</p>
      </div>
      <div style="background: #f9fafb; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 12px 0;">Xin chào <strong>${escapeHtml(fullName || '')}</strong>,</p>
        <p style="margin: 0 0 16px 0; color: #4b5563; line-height: 1.6;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
          Nhấn vào nút bên dưới để tạo mật khẩu mới:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p style="margin: 16px 0 8px 0; color: #6b7280; font-size: 13px;">
          Hoặc copy link sau vào trình duyệt:
        </p>
        <p style="margin: 0 0 16px 0; word-break: break-all; background: white; border: 1px solid #e5e7eb; padding: 10px; border-radius: 6px; font-size: 12px; color: #2563eb;">
          ${escapeHtml(resetUrl)}
        </p>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 20px;">
          <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 12px;">
            ⏱️ Link có hiệu lực trong <strong>${expiresInMinutes} phút</strong>.
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    await t.sendMail({
      from: `"EngCenter" <${process.env.MAIL_USER}>`,
      to,
      subject: '[EngCenter] Yêu cầu đặt lại mật khẩu',
      html,
    });
    return true;
  } catch (err) {
    console.error('[mailer] Gửi email reset thất bại:', err.message);
    return false;
  }
};

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default { sendContactNotification, sendPasswordReset };

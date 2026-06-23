import contactService from '../services/contact.service.js';

const createMessage = async (req, res) => {
  try {
    const data = await contactService.createMessage(req.body);
    res.status(201).json({
      success: true,
      message: 'Đã gửi tin nhắn. Chúng tôi sẽ phản hồi trong 24 giờ.',
      data: { id: data.id },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gửi tin nhắn thất bại',
    });
  }
};

const listMessages = async (req, res) => {
  try {
    const { status, page, pageSize } = req.query;
    const data = await contactService.listMessages({ status, page, pageSize });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const data = await contactService.updateStatus(id, status);
    res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await contactService.deleteMessage(id);
    res.status(200).json({ success: true, message: 'Đã xóa tin nhắn' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const data = await contactService.getStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export default {
  createMessage,
  listMessages,
  updateStatus,
  deleteMessage,
  getStats,
};

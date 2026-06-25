import multer from 'multer';

const storage = multer.memoryStorage();

// Default upload — dùng cho ảnh (thumbnail, avatar, image flashcard)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Video upload — limit lớn hơn cho video lesson
export const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Question media — audio + image cho câu hỏi listening/visual
export const uploadQuestionMedia = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB — đủ cho audio TOEIC 5-10 phút
});

// Document — học liệu, mọi loại file (pdf, word, excel, ppt, video, audio)
export const uploadDocument = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export default upload;

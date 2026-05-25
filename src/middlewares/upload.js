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

export default upload;

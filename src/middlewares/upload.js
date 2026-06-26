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

// Document — học liệu, whitelist các MIME phổ biến
const ALLOWED_DOC_MIMES = new Set([
  // PDF
  'application/pdf',
  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text
  'text/plain',
  'text/csv',
  // Image
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/x-m4a',
  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime',
  // Zip
  'application/zip',
  'application/x-zip-compressed',
]);

const ALLOWED_DOC_EXTS = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'csv',
  'jpg', 'jpeg', 'png', 'webp', 'gif',
  'mp3', 'wav', 'm4a',
  'mp4', 'webm', 'mov',
  'zip',
]);

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    const mimeOk = ALLOWED_DOC_MIMES.has(file.mimetype);
    const extOk = ALLOWED_DOC_EXTS.has(ext);
    // Cần cả mime + extension hợp lệ (chống fake extension)
    if (mimeOk && extOk) return cb(null, true);
    return cb(
      new Error(
        `Định dạng file không hợp lệ (.${ext} / ${file.mimetype}). Chỉ chấp nhận PDF, Office, ảnh, audio, video, zip.`,
      ),
    );
  },
});

export default upload;

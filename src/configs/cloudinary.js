import { v2 as cloudinary } from 'cloudinary';

const uploadImage = async (file) => {
  const base64Image = Buffer.from(file.buffer).toString('base64');
  const dataURI = `data:${file.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.uploader.upload(dataURI);
  return uploadResponse.secure_url;
};

// Video upload qua stream — memory-efficient hơn base64 cho file lớn (50-100MB)
const uploadVideo = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'lessons',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
};

// Audio upload — Cloudinary xử lý audio dưới resource_type 'video'
const uploadAudio = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'quiz-audio',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
};

// PDF / document upload — dùng resource_type 'raw' cho file không phải image/video
const uploadPdf = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'lessons/pdfs',
        // Giữ extension để URL có .pdf, browser nhận diện đúng MIME
        public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, '')}`,
        format: 'pdf',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
};

export default {
  uploadImage,
  uploadVideo,
  uploadAudio,
  uploadPdf,
};

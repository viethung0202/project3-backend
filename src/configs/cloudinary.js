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

// Generic document upload — auto-detect resource_type theo mimetype
// Hỗ trợ PDF, Word, Excel, PPT, video, audio, image
const uploadDocument = (file) => {
  return new Promise((resolve, reject) => {
    const mime = file.mimetype || '';
    let resourceType = 'raw';
    if (mime.startsWith('image/')) resourceType = 'image';
    else if (mime.startsWith('video/') || mime.startsWith('audio/'))
      resourceType = 'video';
    else if (mime === 'application/pdf') resourceType = 'image';

    const original = file.originalname.replace(/\.[^/.]+$/, '');
    const ext = file.originalname.split('.').pop() || '';
    const opts = {
      resource_type: resourceType,
      folder: 'documents',
      public_id: `${Date.now()}_${original}`,
    };
    if (resourceType === 'raw' && ext) opts.format = ext;
    if (mime === 'application/pdf') opts.format = 'pdf';

    const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err) return reject(err);
      resolve({ url: result.secure_url, resourceType });
    });
    stream.end(file.buffer);
  });
};

export default {
  uploadImage,
  uploadVideo,
  uploadAudio,
  uploadPdf,
  uploadDocument,
};

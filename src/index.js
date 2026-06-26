import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectDB } from './configs/index.js';
import authRoute from './routes/auth.route.js';
import answerRoute from './routes/answer.route.js';
import courseRoute from './routes/course.route.js';
import flashcardRoute from './routes/flashcard.route.js';
import lessonRoute from './routes/lesson.route.js';
import moduleRoute from './routes/module.route.js';
import questionRoute from './routes/question.route.js';
import quizRoute from './routes/quiz.route.js';
import userRoute from './routes/user.route.js';
import adminRoute from './routes/admin.route.js';
import enrollmentRoute from './routes/enrollment.route.js';
import staffRoute from './routes/staff.route.js';
import academicRoute from './routes/academic.route.js';
import teacherRoute from './routes/teacher.route.js';
import studentRoute from './routes/student.route.js';
import attemptRoute from './routes/attempt.route.js';
import documentRoute from './routes/document.route.js';
import testRoute from './routes/test.route.js';
import testPartRoute from './routes/testPart.route.js';
import testPassageRoute from './routes/testPassage.route.js';
import testQuestionRoute from './routes/testQuestion.route.js';
import testAnswerRoute from './routes/testAnswer.route.js';
import testAttemptRoute from './routes/testAttempt.route.js';
import contactRoute from './routes/contact.route.js';
import certificateRoute from './routes/certificate.route.js';
import evaluationRoute from './routes/evaluation.route.js';
import leaderboardRoute from './routes/leaderboard.route.js';
import { v2 as cloudinary } from 'cloudinary';

// Load biến môi trường
dotenv.config();

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ====================== MIDDLEWARE ======================
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ====================== ROUTES ======================
app.use('/api/auth', authRoute);
app.use('/api/answers', answerRoute);
app.use('/api/courses', courseRoute);
app.use('/api', flashcardRoute);
app.use('/api/lessons', lessonRoute);
app.use('/api/modules', moduleRoute);
app.use('/api/questions', questionRoute);
app.use('/api/quizzes', quizRoute);
app.use('/api/users', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/enrollments', enrollmentRoute);
app.use('/api/staff', staffRoute);
app.use('/api/academic', academicRoute);
app.use('/api/teacher', teacherRoute);
app.use('/api/student', studentRoute);
app.use('/api/attempts', attemptRoute);
app.use('/api/documents', documentRoute);
app.use('/api/tests', testRoute);
app.use('/api/test-parts', testPartRoute);
app.use('/api/test-passages', testPassageRoute);
app.use('/api/test-questions', testQuestionRoute);
app.use('/api/test-answers', testAnswerRoute);
app.use('/api/test-attempts', testAttemptRoute);
app.use('/api/contact', contactRoute);
app.use('/api/certificates', certificateRoute);
app.use('/api/evaluations', evaluationRoute);
app.use('/api/leaderboard', leaderboardRoute);

// Route test cơ bản
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API đang chạy!',
    version: '1.0.0',
  });
});

// ====================== ERROR HANDLING ======================
app.use((err, req, res, next) => {
  // Multer errors (file size, fileFilter reject, ...)
  if (err && err.name === 'MulterError') {
    let msg = 'Upload file thất bại';
    if (err.code === 'LIMIT_FILE_SIZE') msg = 'File quá lớn';
    return res.status(400).json({ success: false, message: msg });
  }
  // fileFilter custom error (Error object, không phải MulterError)
  if (err && err.message && req.file === undefined && req.files === undefined) {
    return res.status(400).json({ success: false, message: err.message });
  }

  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Có lỗi xảy ra từ server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ====================== START SERVER ======================
const startServer = async () => {
  try {
    await connectDB(); // Kết nối Database

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(` Server đang chạy tại: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' Không thể khởi động server:', error.message);
    process.exit(1);
  }
};

startServer();

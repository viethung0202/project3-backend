# Project3 Backend

Backend API cho nền tảng học tập/luyện thi TOEIC (khóa học, bài giảng, flashcard, quiz, đề thi thử online, tài liệu, chứng chỉ, đánh giá, bảng xếp hạng...).

## Tech Stack

- **Node.js** + **Express 5**
- **PostgreSQL** + **Prisma ORM** (multi-file schema)
- **JWT** (jsonwebtoken) cho xác thực, cookie-based session
- **Cloudinary** + **Multer** cho upload file/ảnh
- **Nodemailer** cho gửi email (reset password, thông báo...)

## Yêu cầu môi trường

- Node.js >= 18
- PostgreSQL

## Cài đặt

```bash
# Cài dependencies
npm install

# Tạo file .env (xem mục Biến môi trường bên dưới)

# Generate Prisma client
npx prisma generate

# Chạy migration
npx prisma migrate dev

# Chạy server (dev - có nodemon)
npm run dev

# Chạy server (production)
npm start
```

Mặc định server chạy tại `http://localhost:5000`.

## Biến môi trường

Tạo file `.env` ở thư mục gốc với các biến sau:

```env
# Database
DATABASE_URL=
DIRECT_URL=

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Mailer
MAIL_USER=
MAIL_PASS=
MAIL_ADMIN=
```

## Cấu trúc thư mục

```
prisma/               # Schema Prisma (multi-file) + migrations
src/
  configs/            # Kết nối DB, Cloudinary, Mailer
  controllers/        # Xử lý request/response
  services/           # Business logic
  routes/             # Định nghĩa API routes
  middlewares/        # Auth, phân quyền, upload file
  index.js            # Điểm khởi động ứng dụng
scripts/              # Script seed dữ liệu, migrate tiện ích
```

## API chính

Base URL: `/api`

| Nhóm | Prefix |
| --- | --- |
| Xác thực | `/auth` |
| Người dùng | `/users` |
| Khóa học | `/courses`, `/modules`, `/lessons` |
| Ghi danh | `/enrollments` |
| Flashcard | `/flashcards` |
| Quiz | `/quizzes`, `/questions`, `/answers`, `/attempts` |
| Đề thi thử online | `/tests`, `/test-parts`, `/test-passages`, `/test-questions`, `/test-answers`, `/test-attempts` |
| Tài liệu | `/documents` |
| Chứng chỉ | `/certificates` |
| Đánh giá học viên | `/evaluations` |
| Bảng xếp hạng | `/leaderboard` |
| Liên hệ | `/contact` |
| Quản trị | `/admin`, `/staff`, `/teacher`, `/student`, `/academic` |

## License

ISC

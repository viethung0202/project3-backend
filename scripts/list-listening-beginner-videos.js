// List all video URLs in course "Listening Beginner"
// Run: node scripts/list-listening-beginner-videos.js

import prisma from '../src/configs/index.js';

const VIDEO_EXTS = ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v'];

async function main() {
  const course = await prisma.course.findFirst({
    where: {
      title: { contains: 'listening', mode: 'insensitive' },
      AND: { title: { contains: 'beginner', mode: 'insensitive' } },
    },
    select: { id: true, title: true },
  });
  if (!course) {
    console.error('Không tìm thấy course "listening beginner"');
    process.exit(1);
  }
  console.log(`Course: ${course.title} (${course.id})\n`);

  // 1. Lesson legacy videoUrl
  const lessons = await prisma.lesson.findMany({
    where: {
      module: { courseId: course.id },
      videoUrl: { not: null },
    },
    select: {
      id: true,
      title: true,
      videoUrl: true,
      module: { select: { title: true } },
    },
    orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
  });

  console.log(`=== LESSON videoUrl (legacy, ${lessons.length}) ===`);
  if (lessons.length === 0) {
    console.log('  (không có)');
  } else {
    for (const l of lessons) {
      console.log(`\n[${l.module.title}] ${l.title}`);
      console.log(`  ${l.videoUrl}`);
    }
  }

  // 2. Documents loại video
  const docs = await prisma.document.findMany({
    where: {
      courseId: course.id,
      fileType: { in: VIDEO_EXTS },
    },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      fileType: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n=== DOCUMENT loại video (${docs.length}) ===`);
  if (docs.length === 0) {
    console.log('  (không có)');
  } else {
    for (const d of docs) {
      console.log(`\n${d.title}  [.${d.fileType}]`);
      console.log(`  ${d.fileUrl}`);
    }
  }

  // 3. Document gắn vào lesson trong course (via LessonDocument)
  try {
    const lessonDocs = await prisma.lessonDocument.findMany({
      where: {
        lesson: { module: { courseId: course.id } },
        document: { fileType: { in: VIDEO_EXTS } },
      },
      select: {
        lesson: { select: { title: true } },
        document: {
          select: { id: true, title: true, fileUrl: true, fileType: true },
        },
      },
    });

    if (lessonDocs.length > 0) {
      console.log(`\n=== Document video gắn lesson (${lessonDocs.length}) ===`);
      for (const ld of lessonDocs) {
        console.log(`\n[Lesson: ${ld.lesson.title}] ${ld.document.title}`);
        console.log(`  ${ld.document.fileUrl}`);
      }
    }
  } catch (err) {
    // Prisma Client có thể chưa biết LessonDocument nếu chưa regenerate — bỏ qua
    console.log('\n(Bỏ qua kiểm tra LessonDocument vì Prisma Client chưa regenerate)');
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('FATAL:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});

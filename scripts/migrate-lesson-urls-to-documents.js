// Migrate legacy lesson.pdfUrl / lesson.videoUrl → Document + LessonDocument
// Run: node scripts/migrate-lesson-urls-to-documents.js
//
// Mỗi lesson có pdfUrl/videoUrl không null sẽ tạo 1 Document tương ứng và link vào lesson.
// uploadedById = createdBy của course (giáo vụ).
// Sau khi migrate: set pdfUrl/videoUrl = null để không double-render.

import prisma from '../src/configs/index.js';

function extFromUrl(url, fallback) {
  if (!url) return fallback;
  const clean = url.split('?')[0];
  const m = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  return m ? m[1].toLowerCase() : fallback;
}

async function migrateOne(lesson, kind /* 'pdf' | 'video' */) {
  const url = kind === 'pdf' ? lesson.pdfUrl : lesson.videoUrl;
  if (!url) return null;

  const fileType = extFromUrl(url, kind === 'pdf' ? 'pdf' : 'mp4');
  const title =
    kind === 'pdf'
      ? `PDF - ${lesson.title}`
      : `Video - ${lesson.title}`;
  const description = `Tài liệu cũ tự động chuyển từ lesson "${lesson.title}"`;

  const courseId = lesson.module?.courseId || null;
  const uploadedById = lesson.module?.course?.createdById || null;
  if (!uploadedById) {
    console.warn(
      `  ⚠ Bỏ qua lesson ${lesson.id} (${kind}): không tìm thấy uploadedById`,
    );
    return null;
  }

  // Tạo document
  const doc = await prisma.document.create({
    data: {
      title,
      description,
      fileUrl: url,
      fileType,
      courseId,
      uploadedById,
      isPublished: true,
      allowDownload: true,
    },
    select: { id: true },
  });

  // Tìm order hiện có
  const maxOrder = await prisma.lessonDocument.aggregate({
    where: { lessonId: lesson.id },
    _max: { order: true },
  });
  const order = (maxOrder._max.order || 0) + 1;

  await prisma.lessonDocument.create({
    data: { lessonId: lesson.id, documentId: doc.id, order },
  });

  return doc.id;
}

async function main() {
  console.log('--- Migrate legacy lesson URLs → Documents ---\n');

  const lessons = await prisma.lesson.findMany({
    where: {
      OR: [{ pdfUrl: { not: null } }, { videoUrl: { not: null } }],
    },
    select: {
      id: true,
      title: true,
      pdfUrl: true,
      videoUrl: true,
      module: {
        select: {
          courseId: true,
          course: { select: { createdById: true } },
        },
      },
    },
  });

  console.log(`Tìm thấy ${lessons.length} lesson có file legacy.\n`);

  let pdfCount = 0;
  let videoCount = 0;
  let skipped = 0;

  for (const lesson of lessons) {
    if (lesson.pdfUrl) {
      try {
        const id = await migrateOne(lesson, 'pdf');
        if (id) {
          console.log(`  ✓ ${lesson.title.padEnd(40)} → PDF doc ${id}`);
          pdfCount++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`  ✗ ${lesson.title} (pdf):`, err.message);
        skipped++;
      }
    }
    if (lesson.videoUrl) {
      try {
        const id = await migrateOne(lesson, 'video');
        if (id) {
          console.log(`  ✓ ${lesson.title.padEnd(40)} → Video doc ${id}`);
          videoCount++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`  ✗ ${lesson.title} (video):`, err.message);
        skipped++;
      }
    }
  }

  // Clear legacy fields cho lesson đã migrate xong
  if (pdfCount + videoCount > 0) {
    const lessonIds = lessons.map((l) => l.id);
    const cleared = await prisma.lesson.updateMany({
      where: { id: { in: lessonIds } },
      data: { pdfUrl: null, videoUrl: null },
    });
    console.log(`\nĐã clear pdfUrl/videoUrl cho ${cleared.count} lesson.`);
  }

  console.log(
    `\n--- Done: ${pdfCount} PDF, ${videoCount} Video, ${skipped} skipped ---`,
  );
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('FATAL:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});

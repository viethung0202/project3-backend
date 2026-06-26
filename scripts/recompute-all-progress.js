// Re-compute progress cho TẤT CẢ enrollments hiện có
// Run sau khi đổi logic recomputeProgress (lesson + quiz)
// node scripts/recompute-all-progress.js

import prisma from '../src/configs/index.js';
import lessonService from '../src/services/lesson.service.js';

async function main() {
  console.log('--- Re-compute progress for all enrollments ---\n');

  const enrollments = await prisma.enrollment.findMany({
    select: {
      id: true,
      studentId: true,
      courseId: true,
      progress: true,
      student: { select: { fullName: true } },
      course: { select: { title: true } },
    },
  });

  console.log(`Tìm thấy ${enrollments.length} enrollments\n`);

  let updated = 0;
  let unchanged = 0;
  for (const e of enrollments) {
    try {
      const oldProgress = e.progress;
      const result = await lessonService.recomputeProgress(
        e.studentId,
        e.courseId,
      );
      const newProgress = Math.round(result.progress * 10) / 10;

      const diff = Math.abs(newProgress - oldProgress) > 0.05;
      const label =
        `[${e.student?.fullName || '?'}] ${e.course?.title || '?'}`.padEnd(50);

      if (diff) {
        console.log(
          `  ${label} ${oldProgress.toFixed(1).padStart(5)}% → ${newProgress.toFixed(1).padStart(5)}%  ` +
            `(${result.completedLessons}/${result.totalLessons} lesson, ${result.passedQuizzes}/${result.totalQuizzes} quiz)`,
        );
        updated++;
      } else {
        unchanged++;
      }
    } catch (err) {
      console.error(`  ✗ ${e.studentId}/${e.courseId}:`, err.message);
    }
  }

  console.log(`\n--- Done: ${updated} updated, ${unchanged} unchanged ---`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('FATAL:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});

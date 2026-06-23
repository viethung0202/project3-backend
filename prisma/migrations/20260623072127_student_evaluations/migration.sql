-- CreateEnum
CREATE TYPE "EvaluationGrade" AS ENUM ('EXCELLENT', 'GOOD', 'AVERAGE', 'FAIR', 'POOR');

-- CreateTable
CREATE TABLE "student_evaluations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "evaluatedById" TEXT NOT NULL,
    "overallGrade" "EvaluationGrade" NOT NULL,
    "listeningScore" DOUBLE PRECISION,
    "speakingScore" DOUBLE PRECISION,
    "readingScore" DOUBLE PRECISION,
    "writingScore" DOUBLE PRECISION,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_evaluations_courseId_idx" ON "student_evaluations"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "student_evaluations_studentId_courseId_key" ON "student_evaluations"("studentId", "courseId");

-- AddForeignKey
ALTER TABLE "student_evaluations" ADD CONSTRAINT "student_evaluations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_evaluations" ADD CONSTRAINT "student_evaluations_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_evaluations" ADD CONSTRAINT "student_evaluations_evaluatedById_fkey" FOREIGN KEY ("evaluatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

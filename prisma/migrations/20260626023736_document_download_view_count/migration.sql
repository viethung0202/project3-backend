-- DropIndex
DROP INDEX "lesson_documents_documentId_idx";

-- DropIndex
DROP INDEX "lesson_documents_lessonId_idx";

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

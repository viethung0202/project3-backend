-- Bảng nối lesson-document (many-to-many)
CREATE TABLE "lesson_documents" (
  "id" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lesson_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lesson_documents_lessonId_documentId_key"
  ON "lesson_documents"("lessonId", "documentId");

CREATE INDEX "lesson_documents_lessonId_idx" ON "lesson_documents"("lessonId");
CREATE INDEX "lesson_documents_documentId_idx" ON "lesson_documents"("documentId");

ALTER TABLE "lesson_documents"
  ADD CONSTRAINT "lesson_documents_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "lessons"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_documents"
  ADD CONSTRAINT "lesson_documents_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

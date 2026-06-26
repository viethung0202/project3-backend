-- Drop old document_reviews table (chứa teacherId — table rỗng nên drop an toàn)
DROP TABLE IF EXISTS "document_reviews" CASCADE;

-- Học sinh đánh giá học liệu (rating 1-5 + comment)
CREATE TABLE "document_reviews" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "document_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_reviews_documentId_studentId_key"
  ON "document_reviews"("documentId", "studentId");

ALTER TABLE "document_reviews"
  ADD CONSTRAINT "document_reviews_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "document_reviews"
  ADD CONSTRAINT "document_reviews_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Giáo viên góp ý nội dung học liệu (chỉ text, không có rating)
CREATE TABLE "document_feedbacks" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "document_feedbacks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_feedbacks_documentId_teacherId_key"
  ON "document_feedbacks"("documentId", "teacherId");

ALTER TABLE "document_feedbacks"
  ADD CONSTRAINT "document_feedbacks_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "document_feedbacks"
  ADD CONSTRAINT "document_feedbacks_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

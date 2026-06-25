-- Add publish + download fields to documents
ALTER TABLE "documents"
  ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "allowDownload" BOOLEAN NOT NULL DEFAULT true;

-- Reviews of documents by teachers
CREATE TABLE "document_reviews" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "document_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_reviews_documentId_teacherId_key"
  ON "document_reviews"("documentId", "teacherId");

ALTER TABLE "document_reviews"
  ADD CONSTRAINT "document_reviews_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "document_reviews"
  ADD CONSTRAINT "document_reviews_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

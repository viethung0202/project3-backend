import express from 'express';
import flashcardController from '../controllers/flashcard.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { requireRole } from '../middlewares/requireRole.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/flashcard-sets/:id', flashcardController.getFlashcardSetById);
router.put(
  '/flashcard-sets/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  flashcardController.updateFlashcardSet,
);
router.delete(
  '/flashcard-sets/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  flashcardController.deleteFlashcardSet,
);
router.post(
  '/flashcard-sets/:setId/flashcards',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  upload.single('image'),
  flashcardController.createFlashcard,
);
router.put(
  '/flashcards/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  upload.single('image'),
  flashcardController.updateFlashcard,
);
router.delete(
  '/flashcards/:id',
  protectRoute,
  requireRole(['ACADEMIC_STAFF']),
  flashcardController.deleteFlashcard,
);

export default router;

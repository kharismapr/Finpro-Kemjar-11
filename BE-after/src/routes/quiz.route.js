const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/quizController');
const { authenticate, isAdmin } = require('../middleware/Auth');
const { questionValidation, answerValidation, searchValidation } = require('../middleware/Validator');

// FIX: Hanya admin yang bisa create question
router.post('/questions', authenticate, isAdmin, questionValidation, QuizController.createQuestion);

// FIX: Semua authenticated users bisa melihat questions
router.get('/questions', authenticate, searchValidation, QuizController.getQuestions);

// FIX: Submit answer dengan validasi
router.post('/answers', authenticate, answerValidation, QuizController.submitAnswer);

// FIX: User hanya bisa lihat jawaban mereka sendiri
router.get('/my-answers', authenticate, searchValidation, QuizController.getMyAnswers);

// FIX: Hanya admin yang bisa lihat semua jawaban
router.get('/admin/answers', authenticate, isAdmin, searchValidation, QuizController.getAllAnswers);

module.exports = router;
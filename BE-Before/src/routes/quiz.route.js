const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/quiz.controller');
const { authenticate, isAdmin } = require('../middleware/auth');

router.post('/questions', authenticate, isAdmin, QuizController.createQuestion);
router.get('/questions', authenticate, QuizController.getQuestions);
router.post('/answers', authenticate, QuizController.submitAnswer); // Time-based Blind SQLi
router.get('/my-answers', authenticate, QuizController.getMyAnswers);

module.exports = router;
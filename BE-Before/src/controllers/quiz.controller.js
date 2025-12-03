const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');

class QuizController {
    // VULNERABILITY: Admin bisa create question tanpa validasi
    static async createQuestion(req, res) {
        try {
        const { question, options, correctAnswer } = req.body;
        
        // VULNERABLE: SQL Injection di semua field
        await Question.create(question, options, correctAnswer);
        
        res.json({ message: 'Question created' });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }

    static async getQuestions(req, res) {
        try {
        // VULNERABLE: Tidak ada pagination, bisa DOS
        const result = await Question.findAll();
        
        // VULNERABILITY: Mengirim correct answer ke user biasa
        const questions = result.rows.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options
            // correct_answer dikirim ke admin, tapi ini cuma frontend check
        }));
        
        res.json(questions);
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }

    // VULNERABILITY: Time-based Blind SQL Injection
    static async submitAnswer(req, res) {
        try {
        const { questionId, answer } = req.body;
        const userId = req.user.id;
        
        // VULNERABLE: User input langsung ke query
        const result = await Answer.submit(userId, questionId, answer);
        
        if (result.rowCount > 0) {
            // Update user score
            const scoreResult = await Answer.getUserAnswers(userId);
            const totalScore = scoreResult.rows.reduce((sum, row) => sum + row.score, 0);
            
            // VULNERABLE: SQL Injection di updateScore
            await User.updateScore(userId, totalScore);
        }
        
        res.json({ message: 'Answer submitted' });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }

    // VULNERABILITY: User bisa lihat jawaban user lain melalui IDOR
    static async getMyAnswers(req, res) {
        try {
        // VULNERABLE: Blind SQL Injection via userId
        const result = await Answer.getUserAnswers(req.user.id);
        res.json(result.rows);
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }
}

module.exports = QuizController;
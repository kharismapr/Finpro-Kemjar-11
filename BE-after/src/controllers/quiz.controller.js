const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');

class QuizController {
    static async createQuestion(req, res) {
        try {
        const { question, options, correctAnswer } = req.body;
        
        const result = await Question.create(question, options, correctAnswer);
        
        res.status(201).json({ 
            message: 'Question created successfully',
            question: result.rows[0]
        });
        } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ error: 'Failed to create question' });
        }
    }

    static async getQuestions(req, res) {
        try {
        const { page = 1, limit = 10 } = req.query;
        
        const result = await Question.findAll(page, limit);
        
        // FIX: Tidak mengirim correct answer ke user biasa
        const questions = result.questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options
        }));
        
        res.json({
            questions,
            pagination: result.pagination
        });
        } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ error: 'Failed to get questions' });
        }
    }

    static async submitAnswer(req, res) {
        try {
        const { questionId, answer } = req.body;
        const userId = req.user.id;
        
        // FIX: Validasi question exists
        const questionExists = await Question.findById(questionId);
        if (questionExists.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        const result = await Answer.submit(userId, questionId, answer);
        
        if (result.rowCount > 0) {
            // FIX: Hitung ulang total score dengan query yang aman
            const answersResult = await Answer.getUserAnswers(userId);
            const totalScore = answersResult.answers.reduce((sum, row) => sum + row.score, 0);
            
            await User.updateScore(userId, totalScore);
            
            // Ambil data terbaru
            const updatedUser = await User.findById(userId);
            const submittedAnswer = result.rows[0];
            
            res.json({ 
            message: 'Answer submitted successfully',
            is_correct: submittedAnswer.is_correct,
            score: submittedAnswer.score,
            total_score: updatedUser.rows[0].total_score
            });
        } else {
            res.status(400).json({ error: 'Failed to submit answer' });
        }
        } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
        }
    }

    static async getMyAnswers(req, res) {
        try {
        const { page = 1, limit = 10 } = req.query;
        
        // FIX: User hanya bisa akses jawaban mereka sendiri
        const result = await Answer.getUserAnswers(req.user.id, page, limit);
        
        res.json({
            answers: result.answers,
            pagination: result.pagination
        });
        } catch (error) {
        console.error('Get answers error:', error);
        res.status(500).json({ error: 'Failed to get answers' });
        }
    }

    // FIX: Method untuk admin melihat semua jawaban
    static async getAllAnswers(req, res) {
        try {
        const { page = 1, limit = 10, questionId, userId } = req.query;
        
        // Complex query dengan parameterized statements
        let queryText = `
            SELECT a.*, u.name as user_name, u.email, q.question 
            FROM answers a 
            JOIN users u ON a.user_id = u.id 
            JOIN questions q ON a.question_id = q.id 
            WHERE 1=1
        `;
        
        const queryValues = [];
        let paramCount = 1;
        
        if (questionId) {
            queryText += ` AND a.question_id = $${paramCount}`;
            queryValues.push(questionId);
            paramCount++;
        }
        
        if (userId) {
            queryText += ` AND a.user_id = $${paramCount}`;
            queryValues.push(userId);
            paramCount++;
        }
        
        queryText += ` ORDER BY a.submitted_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        queryValues.push(limit, (page - 1) * limit);
        
        const query = {
            text: queryText,
            values: queryValues
        };
        
        const result = await require('../config/database').pool.query(query);
        
        // Count query
        let countText = 'SELECT COUNT(*) FROM answers WHERE 1=1';
        const countValues = [];
        paramCount = 1;
        
        if (questionId) {
            countText += ` AND question_id = $${paramCount}`;
            countValues.push(questionId);
            paramCount++;
        }
        
        if (userId) {
            countText += ` AND user_id = $${paramCount}`;
            countValues.push(userId);
        }
        
        const countResult = await require('../config/database').pool.query({
            text: countText,
            values: countValues
        });
        
        res.json({
            answers: result.rows,
            pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult.rows[0].count),
            totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
        } catch (error) {
        console.error('Get all answers error:', error);
        res.status(500).json({ error: 'Failed to get answers' });
        }
    }
}

module.exports = QuizController;
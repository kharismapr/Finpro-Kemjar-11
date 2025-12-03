const { pool } = require('../config/database');

class Answer {
    static async submit(userId, questionId, answer) {
        // FIX: Transaction untuk atomic operation
        const client = await pool.connect();
        
        try {
        await client.query('BEGIN');
        
        // FIXED: Parameterized query
        const checkQuery = {
            text: 'SELECT correct_answer FROM questions WHERE id = $1',
            values: [questionId]
        };
        
        const questionResult = await client.query(checkQuery);
        
        if (questionResult.rows.length === 0) {
            throw new Error('Question not found');
        }
        
        const correctAnswer = questionResult.rows[0].correct_answer;
        const isCorrect = correctAnswer === answer;
        const score = isCorrect ? 10 : 0;
        
        // FIXED: Parameterized query dengan UPSERT
        const insertQuery = {
            text: `
            INSERT INTO answers (id, user_id, question_id, answer, is_correct, score, submitted_at)
            VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, NOW())
            ON CONFLICT (user_id, question_id) 
            DO UPDATE SET 
                answer = EXCLUDED.answer,
                is_correct = EXCLUDED.is_correct,
                score = EXCLUDED.score,
                submitted_at = NOW()
            RETURNING *
            `,
            values: [userId, questionId, answer, isCorrect, score]
        };
        
        const result = await client.query(insertQuery);
        
        await client.query('COMMIT');
        return result;
        
        } catch (error) {
        await client.query('ROLLBACK');
        throw error;
        } finally {
        client.release();
        }
    }

    static async getUserAnswers(userId, page = 1, limit = 10) {
        // FIXED: Parameterized query dengan pagination
        const offset = (page - 1) * limit;
        
        const query = {
        text: `
            SELECT a.id, a.question_id, a.answer, a.is_correct, a.score, a.submitted_at, q.question 
            FROM answers a 
            JOIN questions q ON a.question_id = q.id 
            WHERE a.user_id = $1
            ORDER BY a.submitted_at DESC
            LIMIT $2 OFFSET $3
        `,
        values: [userId, limit, offset]
        };
        
        const countQuery = {
        text: 'SELECT COUNT(*) FROM answers WHERE user_id = $1',
        values: [userId]
        };
        
        const [result, countResult] = await Promise.all([
        pool.query(query),
        pool.query(countQuery)
        ]);
        
        return {
        answers: result.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult.rows[0].count),
            totalPages: Math.ceil(countResult.rows[0].count / limit)
        }
        };
    }
    
    // FIX: Validasi bahwa user hanya mengakses jawaban mereka sendiri
    static async validateUserOwnership(answerId, userId) {
        const query = {
        text: 'SELECT EXISTS(SELECT 1 FROM answers WHERE id = $1 AND user_id = $2)',
        values: [answerId, userId]
        };
        const result = await pool.query(query);
        return result.rows[0].exists;
    }
}

module.exports = Answer;
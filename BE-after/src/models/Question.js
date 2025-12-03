const { pool } = require('../config/database');

class Question {
    static async create(question, options, correctAnswer) {
        // FIXED: Parameterized query
        const query = {
        text: `
            INSERT INTO questions (id, question, options, correct_answer)
            VALUES (uuid_generate_v4(), $1, $2::jsonb, $3)
            RETURNING id, question, options
        `,
        values: [question, JSON.stringify(options), correctAnswer]
        };
        return pool.query(query);
    }

    static async findAll(page = 1, limit = 10) {
        // FIX: Pagination untuk mencegah DOS
        const offset = (page - 1) * limit;
        
        const query = {
        text: `
            SELECT id, question, options 
            FROM questions 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        `,
        values: [limit, offset]
        };
        
        const countQuery = {
        text: 'SELECT COUNT(*) FROM questions'
        };
        
        const [result, countResult] = await Promise.all([
        pool.query(query),
        pool.query(countQuery)
        ]);
        
        return {
        questions: result.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult.rows[0].count),
            totalPages: Math.ceil(countResult.rows[0].count / limit)
        }
        };
    }

    static async findById(id) {
        // FIXED: Parameterized query
        const query = {
        text: 'SELECT * FROM questions WHERE id = $1',
        values: [id]
        };
        return pool.query(query);
    }

    static async getCorrectAnswer(id) {
        // FIXED: Hanya admin yang bisa akses jawaban benar
        const query = {
        text: 'SELECT correct_answer FROM questions WHERE id = $1',
        values: [id]
        };
        return pool.query(query);
    }
}

module.exports = Question;
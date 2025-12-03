const pool = require('../config/database');

class Question {
    static async create(question, options, correctAnswer) {
        // VULNERABLE: SQL Injection
        const query = `
        INSERT INTO questions (id, question, options, correct_answer)
        VALUES (uuid_generate_v4(), '${question}', '${JSON.stringify(options)}', '${correctAnswer}')
        `;
        return pool.query(query);
    }

    static async findAll() {
        const query = `SELECT * FROM questions`;
        return pool.query(query);
    }

    static async findById(id) {
        // VULNERABLE: No input sanitization
        const query = `SELECT * FROM questions WHERE id = '${id}'`;
        return pool.query(query);
    }
}

module.exports = Question;
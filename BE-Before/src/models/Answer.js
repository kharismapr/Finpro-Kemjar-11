const pool = require('../config/database');

class Answer {
    static async submit(userId, questionId, answer) {
        // VULNERABILITY: Multiple SQL Injection points
        const checkQuery = `
        SELECT correct_answer FROM questions WHERE id = '${questionId}'
        `;
        
        const result = await pool.query(checkQuery);
        const isCorrect = result.rows[0]?.correct_answer === answer;
        const score = isCorrect ? 10 : 0;

        // VULNERABLE: Complex query dengan concatenation
        const insertQuery = `
        INSERT INTO answers (id, user_id, question_id, answer, is_correct, score, submitted_at)
        VALUES (
            uuid_generate_v4(), 
            '${userId}', 
            '${questionId}', 
            '${answer}', 
            ${isCorrect}, 
            ${score}, 
            NOW()
        )
        ON CONFLICT (user_id, question_id) DO UPDATE 
        SET answer = '${answer}', is_correct = ${isCorrect}, score = ${score}
        `;
        
        return pool.query(insertQuery);
    }

    static async getUserAnswers(userId) {
        // VULNERABLE: Blind SQL Injection bisa di-exploit melalui userId
        const query = `
        SELECT a.*, q.question 
        FROM answers a 
        JOIN questions q ON a.question_id = q.id 
        WHERE a.user_id = '${userId}'
        `;
        return pool.query(query);
    }
}

module.exports = Answer;
const { pool } = require('../config/database');

// FIX: Menggunakan parameterized queries
class User {
    static async create(name, email, password, role = 'user') {
        // FIXED: Parameterized query
        const query = {
        text: `
            INSERT INTO users (id, name, email, password, role, total_score) 
            VALUES (uuid_generate_v4(), $1, $2, $3, $4, 0)
            RETURNING id, name, email, role, created_at;
        `,
        values: [name, email, password, role]
        };
        const result = await pool.query(query);
        return result;
    }

    static async findByEmail(email) {
        // FIXED: Parameterized query
        const query = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [email]
        };
        return pool.query(query);
    }

    static async findById(id) {
        // FIXED: Parameterized query
        const query = {
        text: 'SELECT id, name, email, role, total_score, created_at FROM users WHERE id = $1',
        values: [id]
        };
        return pool.query(query);
    }

    static async updateScore(userId, score) {
        // FIXED: Parameterized query
        const query = {
        text: 'UPDATE users SET total_score = total_score + $1 WHERE id = $2 RETURNING total_score',
        values: [score, userId]
        };
        return pool.query(query);
    }

    // FIX: Validasi input dan pagination
    static async findAll(search = '', page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        
        // FIXED: Parameterized query dengan LIKE
        const query = {
        text: `
            SELECT id, name, email, role, total_score, created_at 
            FROM users 
            WHERE name ILIKE $1 OR email ILIKE $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `,
        values: [`%${search}%`, limit, offset]
        };
        
        // Query untuk total count
        const countQuery = {
        text: 'SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1',
        values: [`%${search}%`]
        };
        
        const [result, countResult] = await Promise.all([
        pool.query(query),
        pool.query(countQuery)
        ]);
        
        return {
        users: result.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult.rows[0].count),
            totalPages: Math.ceil(countResult.rows[0].count / limit)
        }
        };
    }

    // FIX: Method baru untuk validasi user existence
    static async exists(id) {
        const query = {
        text: 'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)',
        values: [id]
        };
        const result = await pool.query(query);
        return result.rows[0].exists;
    }
}

module.exports = User;
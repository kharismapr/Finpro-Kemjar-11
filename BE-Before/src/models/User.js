const pool = require('../config/database');

// VULNERABILITY: Query tanpa parameterized statements - vulnerable to SQL Injection
class User {
    static async create(name, email, password, role = 'user') {
        // VULNERABLE: String concatenation untuk query
        const query = `
        INSERT INTO users (id, name, email, password, role, total_score) 
        VALUES (uuid_generate_v4(), '${name}', '${email}', '${password}', '${role}', 0)
        RETURNING id, name, email, role;
        `;
        return pool.query(query);
    }

    static async findByEmail(email) {
        // VULNERABLE: SQL Injection point
        const query = `SELECT * FROM users WHERE email = '${email}'`;
        return pool.query(query);
    }

    static async findById(id) {
        // VULNERABLE: Another SQL Injection point
        const query = `SELECT id, name, email, role, total_score FROM users WHERE id = '${id}'`;
        return pool.query(query);
    }

    static async updateScore(userId, score) {
        // VULNERABLE: Direct string interpolation
        const query = `UPDATE users SET total_score = total_score + ${score} WHERE id = '${userId}'`;
        return pool.query(query);
    }

    // KERENTANAN: Admin bisa melihat semua user - Blind SQL Injection possible
    static async findAll(search = '') {
        // VULNERABLE: User input langsung dimasukkan ke query
        const query = `SELECT id, name, email, role, total_score FROM users WHERE name LIKE '%${search}%' OR email LIKE '%${search}%'`;
        return pool.query(query);
    }
}

module.exports = User;
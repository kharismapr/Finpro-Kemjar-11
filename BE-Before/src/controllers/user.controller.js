const User = require('../models/User');

class UserController {
    // VULNERABILITY: Blind SQL Injection vulnerability
    static async getUsers(req, res) {
        try {
        const { search } = req.query;
        
        // VULNERABLE: User input langsung ke query - Blind SQL Injection possible
        // Contoh exploit: search=' OR '1'='1' --
        const result = await User.findAll(search || '');
        
        res.json(result.rows);
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }

    // VULNERABILITY: IDOR (Insecure Direct Object Reference)
    static async getUserById(req, res) {
        try {
        const { id } = req.params;
        
        // VULNERABLE: User bisa akses data user lain
        const result = await User.findById(id);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.rows[0]);
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }

    // KERENTANAN: Admin bisa set score secara langsung
    static async updateUserScore(req, res) {
        try {
        const { userId } = req.params;
        const { score } = req.body;
        
        // VULNERABLE: No authorization check
        await User.updateScore(userId, score);
        
        res.json({ message: 'Score updated' });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;
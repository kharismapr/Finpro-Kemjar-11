const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcrypt');

class AuthController {
    // VULNERABILITY: No rate limiting, no input validation
    static async register(req, res) {
        try {
        const { name, email, password, role } = req.body;
        
        // VULNERABLE: No password complexity check
        const hashedPassword = await bcrypt.hash(password, 5); // Salt rounds terlalu rendah
        
        // VULNERABLE: SQL Injection via email/name
        const result = await User.create(name, email, hashedPassword, role);
        
        const token = generateToken(result.rows[0]);
        
        res.json({ 
            user: result.rows[0], 
            token 
        });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }

    static async login(req, res) {
        try {
        const { email, password } = req.body;
        
        // VULNERABLE: SQL Injection point
        const result = await User.findByEmail(email);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = generateToken(user);
        
        // VULNERABLE: Mengirim password hash ke client
        res.json({ 
            user: { ...user, password: undefined }, 
            token 
        });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }

    // VULNERABIITY: No proper logout mechanism
    static logout(req, res) {
        res.json({ message: 'Logged out' });
        // VULNERABLE: Token tidak di-blacklist
    }
}

module.exports = AuthController;
const User = require('../models/User');
const { generateToken, generateRefreshToken, blacklistToken } = require('../middleware/Auth');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

// FIX: Rate limiting untuk mencegah brute force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: 'Too many login attempts, please try again later' },
    skipSuccessfulRequests: true
});

class AuthController {
    static async register(req, res) {
        try {
        const { name, email, password, role = 'user' } = req.body;
        
        // FIX: Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        
        // FIXED: Strong password hashing
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // FIXED: Restrict admin registration
        const finalRole = role === 'admin' && process.env.NODE_ENV === 'production' ? 'user' : role;
        
        const result = await User.create(name, email, hashedPassword, finalRole);
        
        const user = result.rows[0];
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        
        // FIX: Set secure HTTP-only cookie untuk refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.status(201).json({ 
            user: { 
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
            }, 
            token 
        });
        } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        }
    }

    static async login(req, res) {
        try {
        const { email, password } = req.body;
        
        const result = await User.findByEmail(email);
        
        if (result.rows.length === 0) {
            // FIX: Generic error message untuk mencegah user enumeration
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // FIX: Update last login timestamp (jika ada field-nya)
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        
        // Secure cookie untuk refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        res.json({ 
            user: { 
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            total_score: user.total_score
            }, 
            token 
        });
        } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Login failed',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        }
    }

    static async logout(req, res) {
        try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            // FIX: Blacklist token saat logout
            blacklistToken(token);
        }
        
        // Clear refresh token cookie
        res.clearCookie('refreshToken');
        
        res.json({ 
            message: 'Successfully logged out',
            timestamp: new Date().toISOString()
        });
        } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
        }
    }

    static async refreshToken(req, res) {
        try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }
        
        const { verifyToken } = require('../middleware/Auth');
        const decoded = verifyToken(refreshToken);
        
        if (!decoded || decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        
        const result = await User.findById(decoded.id);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const user = result.rows[0];
        const newToken = generateToken(user);
        
        res.json({ token: newToken });
        } catch (error) {
        res.status(401).json({ error: 'Token refresh failed' });
        }
    }

    static async getProfile(req, res) {
        try {
        // FIX: User hanya bisa melihat profil mereka sendiri
        const result = await User.findById(req.user.id);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = result.rows[0];
        
        res.json({ 
            user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            total_score: user.total_score,
            created_at: user.created_at
            }
        });
        } catch (error) {
        res.status(500).json({ error: 'Failed to get profile' });
        }
    }
}

module.exports = { AuthController, loginLimiter };
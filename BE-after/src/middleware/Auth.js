const jwt = require('jsonwebtoken');
const User = require('../models/User');

// FIX: Secret dari environment variable
const JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// FIX: Token blacklist
const tokenBlacklist = new Set();

const generateToken = (user) => {
    // FIXED: Dengan expiration time dan secure algorithm
    return jwt.sign(
        { 
        id: user.id, 
        email: user.email, 
        role: user.role 
        }, 
        JWT_SECRET,
        { 
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256'
        }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
    };

    const verifyToken = (token) => {
    try {
        // FIXED: Verifikasi dengan algoritma dan expiration
        return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
        return null;
    }
    };

    const blacklistToken = (token) => {
    // FIX: Menambahkan token ke blacklist saat logout
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
        tokenBlacklist.add(token);
        }
    }
};

const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
    };

    const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided or invalid format' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // FIX: Cek blacklist
        if (isTokenBlacklisted(token)) {
        return res.status(401).json({ error: 'Token has been revoked' });
        }
        
        const decoded = verifyToken(token);
        
        if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
        }
        
        // FIX: Validasi user masih ada di database
        const userExists = await User.exists(decoded.id);
        if (!userExists) {
        return res.status(401).json({ error: 'User no longer exists' });
        }
        
        // FIX: Ambil data user terbaru dari database
        const result = await User.findById(decoded.id);
        if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
        }
        
        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// FIX: Admin check dengan validasi database
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
        }
        
        // FIXED: Validasi role dari database, bukan dari token saja
        const result = await User.findById(req.user.id);
        const user = result.rows[0];
        
        if (user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Admin access required',
            message: 'You do not have permission to access this resource' 
        });
        }
        
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify admin privileges' });
    }
};

module.exports = { 
    generateToken, 
    generateRefreshToken,
    authenticate, 
    isAdmin,
    blacklistToken,
    verifyToken,
    JWT_SECRET
};
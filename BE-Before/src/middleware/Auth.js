const jwt = require('jsonwebtoken');

// VULNERABILITY 1: Weak secret key
const JWT_SECRET = process.env.JWT_SECRET

// VULNERABILITY 2: No token expiration check
const generateToken = (user) => {
    // VULNERABLE: No expiration time
    return jwt.sign(
        { 
        id: user.id, 
        email: user.email, 
        role: user.role 
        }, 
        JWT_SECRET
    );
};

// VULNERABILITY 3: Insecure token verification
const verifyToken = (token) => {
    try {
        // VULNERABLE: Tidak memverifikasi algoritma
        return jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }); // Ignore expiration!
    } catch (error) {
        return null;
    }
};

// VULNERABILITY 4: Weak middleware authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    // VULNERABLE: Tidak memvalidasi user di database
    req.user = decoded; // Langsung percaya token tanpa validasi
    next();
};

// VULNERABILITY 5: Insecure admin check
const isAdmin = (req, res, next) => {
    // VULNERABLE: Hanya cek dari token, bisa di-spoof
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { generateToken, authenticate, isAdmin };
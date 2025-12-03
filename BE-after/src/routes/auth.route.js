const express = require('express');
const router = express.Router();
const { AuthController, loginLimiter } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/Auth');
const { registerValidation, loginValidation } = require('../middleware/Validator');
const rateLimit = require('express-rate-limit');

// FIX: Rate limiting untuk register
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
    message: { error: 'Too many registration attempts, please try again later' }
});

router.post('/register', registerLimiter, registerValidation, AuthController.register);
router.post('/login', loginLimiter, loginValidation, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/profile', authenticate, AuthController.getProfile);

module.exports = router;
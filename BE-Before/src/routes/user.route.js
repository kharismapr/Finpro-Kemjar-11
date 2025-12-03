const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticate, isAdmin } = require('../middleware/auth');

// VULNERABILITY: Admin-only routes tapi verifikasi lemah
router.get('/', authenticate, isAdmin, UserController.getUsers); // Blind SQL Injection
router.get('/users/:id', authenticate, UserController.getUserById); // IDOR
router.put('/users/:userId/score', authenticate, isAdmin, UserController.updateUserScore);

module.exports = router;
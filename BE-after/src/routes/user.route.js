const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/Auth');
const { searchValidation, userIdValidation } = require('../middleware/Validator');

// FIX: Hanya admin yang bisa melihat semua users
router.get('/', authenticate, isAdmin, searchValidation, UserController.getUsers);
// FIX: User bisa akses profil mereka sendiri, admin bisa akses semua
router.get('/:id', authenticate, userIdValidation, UserController.getUserById);
// FIX: Hanya admin yang bisa update score
router.put('/:userId/score', authenticate, isAdmin, UserController.updateUserScore);

module.exports = router;
const { body, query, param, validationResult } = require('express-validator');

// TAMBAHAN: Validasi input
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
        return next();
        }

        res.status(400).json({ 
        errors: errors.array(),
        message: 'Validation failed' 
        });
    };
};

// Validation rules
const registerValidation = validate([
    body('name').trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .escape(),
    
    body('email').trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
    
    body('role').optional()
        .isIn(['user', 'admin']).withMessage('Role must be user or admin')
]);

const loginValidation = validate([
    body('email').trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
]);

const questionValidation = validate([
    body('question').trim()
        .notEmpty().withMessage('Question is required')
        .isLength({ min: 5, max: 500 }).withMessage('Question must be 5-500 characters')
        .escape(),
    
    body('options')
        .isArray({ min: 2, max: 5 }).withMessage('Must provide 2-5 options')
        .custom((options) => {
        return options.every(opt => typeof opt === 'string' && opt.length > 0);
        }).withMessage('All options must be non-empty strings'),
    
    body('correctAnswer').trim()
        .notEmpty().withMessage('Correct answer is required')
        .escape()
]);

const answerValidation = validate([
    body('questionId')
        .notEmpty().withMessage('Question ID is required')
        .isUUID().withMessage('Invalid question ID format'),
    
    body('answer').trim()
        .notEmpty().withMessage('Answer is required')
        .escape()
]);

const searchValidation = validate([
    query('search').optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Search term too long')
        .escape(),
    
    query('page').optional()
        .isInt({ min: 1 }).withMessage('Page must be positive integer')
        .toInt(),
    
    query('limit').optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
        .toInt()
]);

const userIdValidation = validate([
    param('id')
        .isUUID().withMessage('Invalid user ID format')
]);

module.exports = {
    registerValidation,
    loginValidation,
    questionValidation,
    answerValidation,
    searchValidation,
    userIdValidation,
    validate
};
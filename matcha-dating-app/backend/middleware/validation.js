// ============================================
// VALIDATION MIDDLEWARE
// Input validation using express-validator
// ============================================

const {body, validationResult} = require('express-validator')

// validation rules for user regestration 

const validateRegistration = [

	body('email')
		.trim()
		.isEmail()
		.withMessage('Must be valid email address')
		.normalizeEmail(),

	body('username')
		.trim()
		.isLength({min: 3, max: 30})
		.withMessage('Username must be between 3 and 30 characters')
		.matches(/^[a-zA-Z0-9_]+$/)
		.withMessage('Username can only contain letters, numbers, and underscores'),
	
	body('password')
    	.isLength({ min: 8 })
    	.withMessage('Password must be at least 8 characters long')
    	.matches(/[a-z]/)
    	.withMessage('Password must contain at least one lowercase letter')
    	.matches(/[A-Z]/)
    	.withMessage('Password must contain at least one uppercase letter')
    	.matches(/[0-9]/)
    	.withMessage('Password must contain at least one number'),
  
  	body('first_name')
    	.trim()
    	.notEmpty()
    	.withMessage('First name is required')
    	.isLength({ min: 2, max: 50 })
    	.withMessage('First name must be between 2 and 50 characters'),
  
  	body('last_name')
    	.trim()
    	.notEmpty()
    	.withMessage('Last name is required')
    	.isLength({ min: 2, max: 50 })
    	.withMessage('Last name must be between 2 and 50 characters')
]

// valudatuon rules for user login

const validateLogin = [

	body('identifier')
    	.trim()
    	.notEmpty()
    	.withMessage('Email or username is required'),
  
  	body('password')
    	.notEmpty()
    	.withMessage('Password is required')
]

// Validation rules for password reset request
const validatePasswordResetRequest = [

  	body('email')
  	  .trim()
  	  .isEmail()
  	  .withMessage('Must be a valid email address')
  	  .normalizeEmail()
];

// Validation rules for password reset (with token)
const validatePasswordReset = [

  	body('token')
  	  .trim()
  	  .notEmpty()
  	  .withMessage('Reset token is required')
  	  .isLength({ min: 64, max: 64 })
  	  .withMessage('Invalid reset token format'),
	
  	body('newPassword')
  	  .isLength({ min: 8 })
  	  .withMessage('Password must be at least 8 characters long')
  	  .matches(/[a-z]/)
  	  .withMessage('Password must contain at least one lowercase letter')
  	  .matches(/[A-Z]/)
  	  .withMessage('Password must contain at least one uppercase letter')
  	  .matches(/[0-9]/)
  	  .withMessage('Password must contain at least one number')
];

// Middleware to check validation results
// Call this after validation rules to handle errors
const handleValidationErrors = (req, res, next) => {

  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Export validation rules and error handler
module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  handleValidationErrors
};
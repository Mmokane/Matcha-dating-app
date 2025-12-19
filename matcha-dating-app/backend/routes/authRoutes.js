// ============================================
// AUTH ROUTES
// API endpoints for authentication
// ============================================

const express = require('express');
const router = express.Router();

// Import validation middleware
const {
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  handleValidationErrors
} = require('../middleware/validation');

// Import auth controllers
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');

// Register new user
// POST /api/auth/register
router.post(
  '/register',
  validateRegistration,
  handleValidationErrors,
  register
);

// Verify email with token
// GET /api/auth/verify/:token
router.get(
  '/verify/:token',
  verifyEmail
);

// Login user
// POST /api/auth/login
router.post(
  '/login',
  validateLogin,
  handleValidationErrors,
  login
);

// Request password reset
// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  validatePasswordResetRequest,
  handleValidationErrors,
  forgotPassword
);

// Reset password with token
// POST /api/auth/reset-password
router.post(
  '/reset-password',
  validatePasswordReset,
  handleValidationErrors,
  resetPassword
);

// Logout user
// POST /api/auth/logout
router.post(
  '/logout',
  logout
);

// Export router
module.exports = router;
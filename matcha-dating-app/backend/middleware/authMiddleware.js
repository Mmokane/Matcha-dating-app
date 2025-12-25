// ============================================
// AUTH MIDDLEWARE
// Protects routes by verifying JWT tokens
// ============================================

const { verifyJWT } = require('../utils/tokenGenerator');
const { findUserById } = require('../models/userModel');

// Middleware to protect routes
// Verifies JWT token and attaches user to request
const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. Please log in.'
      });
    }
    
    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. Please log in.'
      });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token. Please log in again.'
      });
    }
    
    // Get user from database
    const user = await findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found. Please log in again.'
      });
    }
    
    // Check if user is verified
    if (!user.verified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your email before accessing this resource.'
      });
    }
    
    // Attach user to request object (without password)
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      verified: user.verified
    };
    
    // Continue to next middleware/controller
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

// Optional middleware to check if user is verified
// Use after protect middleware
const requireVerified = (req, res, next) => {
  if (!req.user.verified) {
    return res.status(403).json({
      status: 'error',
      message: 'Please verify your email to access this feature.'
    });
  }
  next();
};

// Export middleware
module.exports = {
  protect,
  requireVerified
};
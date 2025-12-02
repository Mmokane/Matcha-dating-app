// ============================================
// AUTH CONTROLLER
// Handles authentication logic
// ============================================

const {hashPassword, comparePassword} = require('../utils/passwordUtils')
const {generateJWT, generateRadnomToken} = require('../utils/tokenGenerator')
const {sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail} = require('../utils/emailService')
const {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserByVerificationToken,
  findUserByResetToken,
  updateVerificationStatus,
  updatePassword,
  updateResetToken,
  clearResetToken,
  updateLastLogin
} = require('../models/userModel');

// register a new user
// POST /api/auth/register

const register = async (req, res) => {

	try {

		const {email, username, password, first_name , last_name } = req.body
		// chech if user already exists with this email
		const existingUserByEmail = await findUserByEmail(email)
		if (existingUserByEmail) {
			return res.status(400).json({
				status: 'error',
				message: 'Email already registered'
			})
		}

		// check if username is taken
		const existingUserByUsername = await findUserByUsername(username)
		if (existingUserByUsername) {
			return res.status(400).json ({
				status: 'error',
				message: 'Username already taken'
			})
		}

		// hash the password 
		const password_hash = await hashPassword(password)
		// generate verification token 
		const verification_token = generateRadnomToken()
		// create user in database
		const newUser = await createUser({
			email,
			username,
			password_hash,
			first_name,
			last_name,
			verification_token
		})

		// send verification email 
		try {
			await sendVerificationEmail(email, username, verification_token)
		}
		catch (emailError) {
			console.log('Error sending verification email :', emailError.message)
			// dont fail regisitraion if email fails 
		}

		res.status(201).json({
			status: 'success',
			message: 'Registration successful! Please check your email to verify your account.',
			data: {
				user: {
				id: newUser.id,
				email: newUser.email,
				username: newUser.username,
				first_name: newUser.first_name,
				last_name: newUser.last_name
				}
			}
		})
	}
	catch(error) {
		console.error('Registration error:', error.message);
			res.status(500).json({
			status: 'error',
			message: 'Registration failed',
			error: error.message
			});
		}
	}

// Login user
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // Find user by email or username
    let user = await findUserByEmail(identifier);
    if (!user) {
      user = await findUserByUsername(identifier);
    }
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    // Check if email is verified
    if (!user.verified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your email before logging in'
      });
    }
    
    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    await updateLastLogin(user.id);
    
    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      username: user.username
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          verified: user.verified
        }
      }
    });
    
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
};


// Request password reset
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists (security)
      return res.status(200).json({
        status: 'success',
        message: 'If that email exists, a password reset link has been sent'
      });
    }
    
    // Generate reset token
    const resetToken = generateRandomToken();
    
    // Save reset token with expiration (1 hour)
    await updateResetToken(email, resetToken);
    
    // Send reset email
    try {
      await sendPasswordResetEmail(email, user.username, resetToken);
    } catch (emailError) {
      console.error('Error sending reset email:', emailError.message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send reset email'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'If that email exists, a password reset link has been sent'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Password reset request failed',
      error: error.message
    });
  }
};

// Reset password with token
// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Find user by reset token (checks expiration too)
    const user = await findUserByResetToken(token);
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    }
    
    // Hash new password
    const password_hash = await hashPassword(newPassword);
    
    // Update password
    await updatePassword(user.id, password_hash);
    
    // Clear reset token
    await clearResetToken(user.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset successful! You can now log in with your new password.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Password reset failed',
      error: error.message
    });
  }
};


// Logout user (client-side token removal)
// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    // In JWT authentication, logout is typically handled client-side
    // by removing the token from storage
    
    // Optional: Add token to blacklist here if implementing token blacklist
    // const token = req.headers.authorization?.split(' ')[1];
    // await blacklistToken(token);
    
    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
    
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed',
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  logout
};
// Functions for generating JWT and random tokens

const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// * Generate JWT token for authentication
// * @param {object} payload - Data to include in token (user id, email, etc.)
// * @returns {string} - JWT token

const generateJWT = (payload) => {
	try {
		// create JWT token with payload
		const token = jwt.sign(
			payload, //data to encode (user info)
			process.env.JWT_SECRET, // secret key for singing
			{expiresIn: process.env.JWT_EXPIRE || '7d'} // token expiress in 7days
		)
		return token
	}
	catch (error)
	{
    	throw new Error('Error generating JWT token: ' + error.message);
	}
}

// * Verify JWT token
// * @param {string} token - JWT token to verify
// * @returns {object} - Decoded payload if valid
// * @throws {Error} - If token is invalid or expired

const verifyJWT = (token) => {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		return decoded
	}
	catch (error) {
		if (error.name === 'TokenExpiredError') {
     		throw new Error('Token has expired');
		} else if (error.name === 'JsonWebTokenError') {
			throw new Error('Invalid token');
		} else {
			throw new Error('Error verifying token: ' + error.message);
		}
	}
}

// * Generate random token for email verification or password reset
// * @returns {string}

const generateRandomToken = () => {
	try {
    // Generate 32 random bytes and convert to hex string (64 characters)
		const token = crypto.randomBytes(32).toString('hex')
		return token
	}
	catch (error) {
    	throw new Error('Error generating random token: ' + error.message);
	}
}

module.exports = {
	generateJWT,
	verifyJWT,
	generateRandomToken
}
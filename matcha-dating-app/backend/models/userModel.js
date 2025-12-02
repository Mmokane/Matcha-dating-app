// ============================================
// USER MODEL
// Database queries for user operations
// ============================================

const db = require('../config/db')

// * Create a new user in the database
// * @param {object} userData - User data object
// * @param {string} userData.email - User email
// * @param {string} userData.username - Username
// * @param {string} userData.password_hash - Hashed password
// * @param {string} userData.first_name - First name
// * @param {string} userData.last_name - Last name
// * @param {string} userData.verification_token - Email verification token
// * @returns {Promise<object>} - Created user data

const createUser = async (userData) => {

	try {

		const query = `
			INSERT INTO users (
				email, username, password_hash, first_name, last_name, verification_token
			) VALUE (?, ?, ?, ?, ?, ?)
		`

		const values = [
			userData.email,
      		userData.username,
      		userData.password_hash,
      		userData.first_name,
      		userData.last_name,
      		userData.verification_token
		]
		const [result] = await db.query(query, values)
		// return the created user's ID
		return {
			id: result.insertId,
      		email: userData.email,
      		username: userData.username,
      		first_name: userData.first_name,
      		last_name: userData.last_name
		}
	}
	catch (error) {
		if (error.code === 'ER_DUP_ENTRY') {
			throw new Error('Email or username already exists')
		}
		throw new Error('Error creating user: ' + error.message)
	}
}

// * Find user by email
// * @param {string} email - User email
// * @returns {Promise<object|null>} - User object or null if not found

const findUserByEmail = async (email) => {
	try {

		const query = 'SELECT * FROM users WHERE email = ?'
		const [rows] = await db.query(query, [email])
		return rows.length > 0 ? rows[0] : null
	}
	catch (error) {
		throw new Error('Error finding user by email :' +  error.message)
	}
}

// * Find user by username
// * @param {string} username - Username
// * @returns {Promise<object|null>} - User object or null if not found

const findUserByUsername = async (username) => {

	try {

		const query = 'SELECT * FROM users WHERE username = ?'
		const [rows] = await db.query(query, [username])
		return rows.length > 0 ? rows[0] : null
	}
	catch (error) {
		throw new Error('Error finiding user by username: ' + error.message)
	}
}

// * Find user by ID
// * @param {number} id - User ID
// * @returns {Promise<object|null>} - User object or null if not found


const findUserById = async (id) => {

	try {
		const query = 'SELECT * FROM users WHERE id = ?'
		const [rows] = await db.query(query, [id])
		return rows.length > 0 ? rows[0] : null
	}
	catch (error) {
		throw new Error('Error finding user by ID: ' + error.message)
	}
}

// * Find user by verification token
// * @param {string} token - Verification token
// * @returns {Promise<object|null>} - User object or null if not found

const findUserByVerificationToken = async (token) => {
	
	try {
		const query = 'SELECT * FROM users WHERE verification_token = ?'
		const [rows] = await db.query(query, [token])
		return rows.length > 0 ? rows[0] : null
	}
	catch (error) {
		throw new Error('Error finding the user by verification token: ' + error.message)
	}
}

// * Find user by password reset token
// * @param {string} token - Reset token
// * @returns {Promise<object|null>} - User object or null if not found

const findUserByResetToken = async (token) => {

	try {
		const query = `
		SELECT * FROM users
		WHERE reset_token = ?
		AND reset_token_expires > NOW()
		`
		const [rows] = await db.query(query, [token])
		return rows.length > 0 ? rows[0] : null
	}
	catch(error) {
		throw new Error('Error finding user by reset token :' + error.message)
	}
}

//  * Update user verification status
//  * @param {number} userId - User ID
//  * @returns {Promise<boolean>} - Success status

const updateVerificationStatus = async (userId) => {

	try {

		const query = `
			UPDATE users
			SET verified = TRUE, verification_token = NULL
			WHERE id = ?
		`

		const [result] = await db.query(query, [userId])
		return result.affectedRows > 0
	}
	catch(error) {
		throw new Error('Error updating verification status: ' + error.message)
	}
}

//  * Update user password
//  * @param {number} userId - User ID
//  * @param {string} passwordHash - New hashed password
//  * @returns {Promise<boolean>} - Success status

const updatePassword = async (userId, passwordHash) => {
  try {
    const query = 'UPDATE users SET password_hash = ? WHERE id = ?';
    const [result] = await db.query(query, [passwordHash, userId]);
    
    return result.affectedRows > 0;
    
  } catch (error) {
    throw new Error('Error updating password: ' + error.message);
  }
};

//  * Set password reset token and expiration
//  * @param {string} email - User email
//  * @param {string} token - Reset token
//  * @returns {Promise<boolean>} - Success status

const updateResetToken = async (email, token) => {
  try {
    const query = `
      UPDATE users 
      SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR)
      WHERE email = ?
    `;
    
    const [result] = await db.query(query, [token, email]);
    
    return result.affectedRows > 0;
    
  } catch (error) {
    throw new Error('Error updating reset token: ' + error.message);
  }
};
/** 
 * Clear password reset token after use
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} - Success status
*/


const clearResetToken = async (userId) => {
  try {
    const query = `
      UPDATE users 
      SET reset_token = NULL, reset_token_expires = NULL 
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [userId]);
    
    return result.affectedRows > 0;
    
  } catch (error) {
    throw new Error('Error clearing reset token: ' + error.message);
  }
};

/**
 * Update last login timestamp
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} - Success status
 */
const updateLastLogin = async (userId) => {
  try {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    const [result] = await db.query(query, [userId]);
    
    return result.affectedRows > 0;
    
  } catch (error) {
    throw new Error('Error updating last login: ' + error.message);
  }
};

/**
 * Update user online status
 * @param {number} userId - User ID
 * @param {boolean} isOnline - Online status
 * @returns {Promise<boolean>} - Success status
 */
const updateOnlineStatus = async (userId, isOnline) => {
  try {
    const query = 'UPDATE users SET is_online = ? WHERE id = ?';
    const [result] = await db.query(query, [isOnline, userId]);
    
    return result.affectedRows > 0;
    
  } catch (error) {
    throw new Error('Error updating online status: ' + error.message);
  }
};

// Export all functions
module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  findUserByVerificationToken,
  findUserByResetToken,
  updateVerificationStatus,
  updatePassword,
  updateResetToken,
  clearResetToken,
  updateLastLogin,
  updateOnlineStatus
};
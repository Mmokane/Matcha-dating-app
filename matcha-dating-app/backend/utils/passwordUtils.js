// function for hashin and comparing passwords 


const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
	try {
		// Generate salt (random data added to password before hashing)
    	// 10 is the "cost factor" - higher = more secure but slower
		const salt = await bcrypt.genSalt(10);
		// hash teh password with salt
		const hashedPassword = await bcrypt.hash(password, salt)
		return (hashedPassword)
	}
	catch(error) {
		throw new Error('Error hashing password: ' + error.message)
	}
}

// Compare plain text password with hashed password

const comparedPassword = async (plainPassword, hashedPassword) => {
	try {
		// bcrypt automatically extracts the salt from hashedPassword
		// and uses it to hash plainPassword, then compares
		const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
		return isMatch
	}
	catch(error) {
		throw new Error('Error comparing passwords: ' + error.message);
	}
}

// export functions
module.exports = {
	hashPassword,
	comparePassword: comparedPassword
}
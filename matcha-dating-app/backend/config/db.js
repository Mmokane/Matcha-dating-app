// load env variables
require('dotenv').config();

// Import MySQL2 with promise support
const mysql = require('mysql2/promise')

// Create a connection pool
// A pool maintains multiple connections and reuses them efficiently
const pool = mysql.createPool({

	host: process.env.DB_HOST,           // Database host (localhost)
	user: process.env.DB_USER,           // Database user (root)
	password: process.env.DB_PASSWORD,   // Database password (empty for now)
	database: process.env.DB_NAME,       // Database name (matcha_db)
	port: process.env.DB_PORT,           // Database port (3306)
	waitForConnections: true,            // Wait if no connections available
	connectionLimit: 10,                 // Maximum 10 connections in pool
	queueLimit: 0
})

// test the database connection 

const connection = async() => {

	try {
		const connection = await pool.getConnection()
		console.log("Connection is working good!")
		connection.release() // return connection to the pool
	} catch (error) {
		console.log("Connection is not working good!", error)
		process.exit(1)
	}
}

// test the connection
connection();

// Export the pool for use in other files
module.exports = pool

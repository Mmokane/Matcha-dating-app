// MAIN SERVER FILE 

// 1. IMPORT DEPENDENCIES
// ============================================

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
require('dotenv').config() // Load environment variables

// import database connection 
const db = require('./config/db')

// 2. INITIALIZE EXPRESS APP
// ============================================

const app = express()

// get port from env or default it to 3000

const PORT = process.env.PORT || 3000

// 3. SECURITY MIDDLEWARE
// ============================================

// helmet - sets secure http headers 

app.use(helmet())

// cors - allow frontend to communicate with backend

app.use(cors({
	origin: process.env.FRONTEND_URL || 'http://localhost:5173',
	credentials: true, // allow cookiew to be sent
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization']
}))

// rate limiting - prevent brute force attacks 

const limiter = rateLimit({
	windowMs : 15 * 60 * 1000, // 15 mins
	max: 100, // limit each ip to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later',
	standardHeaders: true,
	legacyHeaders: false
})

// apply rate limiting to all routes

app.use(limiter)

// stricter rate limit for auth routes
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
  	max: 5, // Only 5 login attempts per 15  minutes
  	message: 'Too many login attempts, please try again later.',
  	skipSuccessfulRequests: true
})

// 4. BODY PARSING MIDDLEWARE

// parse JSON requests bodies (req.body)
app.use(express.json())

// parse ULR encoded bodies (for form subbmisions)
app.use(express.urlencoded({extended: true}))

// 5. REQUEST LOGGING (Development)
if (process.env.NODE_ENV === 'development') {
	app.use((req, res, next) => {
		console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`)
		next()
	})
}
// 6. STATIC FILES (For uploaded profile pictures)

// health check route - TEST if server is running 
app.get('/api/health', (req, res) => {
	res.json({
		status : 'success',
		message : 'Server is running !',
		timestamp: new Date().toISOString()
	})
})

app.get('/api/db-test', async (req, res) => {
	try {
		const [rows] = await db.query('SELECT 1 + 1 AS result')
		res.json({
			status: 'succes',
			message: 'Database connection working !',
			result : rows[0].result
		})
	}
	catch (error) {
		res.status(500).json({
			status: 'error',
			message : 'Database connection failed', 
			error: error.message
		})
	}
})

// TODO: Import and use route files when created
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const matchRoutes = require('./routes/matchRoutes');
// const chatRoutes = require('./routes/chatRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const searchRoutes = require('./routes/searchRoutes');

// TODO: Apply routes (uncomment when route files are created)
// app.use('/api/auth', authLimiter, authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/matches', matchRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/search', searchRoutes);

// 8. 404 HANDLER - Route not found

app.use((req, res) => {
	res.status(404).json({
		status: 'error',
		message: 'Route not found'
	})
})

// 9. GLOBAL ERROR HANDLER
// ============================================
// This catches any errors that occur in routes
app.use((err, req, res, next) => {
	console.error('Error', err.stack)

	// set status code (default to 500 if not set)
	const statusCode = err.statusCode || 500
	// Development: Send full error details
	if (process.env.NODE_ENV === 'development') {
		res.status(statusCode).json({
			status: 'error',
			message : err.message,
			stack: err.stack, 
			error: err
		})
	}
	// Production: Send minimal error info (don't expose internals)
	else {
		res.status(statusCode).json({
			status: 'error',
			message : err.message || 'internal server error'
		})
	}
})

// 10. START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('================================================');
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Database test: http://localhost:${PORT}/api/db-test`);
  console.log('================================================');
});

// handle unhandled promise rejections 
process.on('unhandledRejection', (err) => {
	console.error('UNHANDLED REJECTION ! shutting down...')
	console.error(err.name , err.message)
	process.exit(1);
})

// Export app for testing purposes (optional)
module.exports = app;
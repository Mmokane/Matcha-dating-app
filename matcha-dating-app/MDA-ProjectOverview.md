Matcha Dating App - Project Overview
	📋 Table of Contents

		Project Summary
		Technology Stack
		Project Requirements
		Project Structure


	📌 Project Summary
		Matcha is a full-stack dating web application that connects users based on their interests, location, and 	preferences. Users can create profiles, browse potential matches, like other users, chat with matches, and 	receive real-time notifications.
		Key Features
	
		User registration with email verification
		Profile creation with photos and interest tags
		GPS-based location matching
		Intelligent matching algorithm
		Real-time chat between matched users
		Real-time notifications
		Profile visit tracking
		User blocking and reporting
	
	
	💻 Technology Stack
			Backend:

			Runtime: Node.js
			Framework: Express.js (micro-framework)
			Database: MySQL 9.5.0
			Authentication: JWT (JSON Web Tokens)
			Password Hashing: bcryptjs
			Email Service: Nodemailer
			Real-time Communication: Socket.io (for chat & notifications)
			File Upload: Multer
			Security: Helmet, CORS, Express-rate-limit
			Validation: Express-validator

			Frontend:

			Framework: Vue.js 3
			State Management: Vuex/Pinia (TBD)
			Build Tool: Vite
			HTTP Client: Axios
			Real-time Client: Socket.io-client

			Development Tools

			Package Manager: npm
			Environment Variables: dotenv
			Auto-restart: nodemon


	🔒 Project Requirements
		Critical Security Requirements (Must Pass)
		These are non-negotiable - failing any will result in project failure:

			NO plain text passwords - All passwords must be hashed with bcrypt
			NO SQL injection - Use parameterized queries/prepared statements
			NO HTML/JavaScript injection - Validate and sanitize all inputs
			NO unwanted file uploads - Validate file types and sizes
			Form validation - All forms must have proper validation
			Environment variables - Secrets must be in .env (never committed)

		Authentication Requirements

			User registration with email, username, first name, last name, password
			Email verification via unique link
			Login with username and password
			Password reset via email
			One-click logout from any page

		User Profile Requirements

			Gender and sexual preferences
			Biography
			Interest tags (reusable, e.g., #vegan, #geek, #piercing)
			Up to 5 photos (one designated as profile picture)
			GPS location (auto-detect or manual override)
			Public "fame rating" (calculated based on activity)
			View who liked you
			View who visited your profile
			Modify profile information at any time

		Browsing & Matching Requirements
		Suggest profiles based on:

			Sexual orientation compatibility
			Geographic proximity
			Common interest tags
			Fame rating


		Sort by: age, location, fame rating, tags
		Filter by: age, location, fame rating, tags
		Advanced search with multiple criteria

		Chat Requirements

			Real-time chat (maximum 10-second delay)
			Only between matched users (mutual likes)
			Message visibility from any page

		Notification Requirements (Real-time, max 10-second delay)

			Receive a like
			Profile viewed
			New message received
			Match created (mutual like)
			User unliked you
			Visible from any page

		Additional Features

			Like/unlike users
			Block users (they won't appear in searches)
			Report fake accounts
			View if user is online or last seen time

		Technical Requirements

			Must work on latest Firefox and Chrome
			Mobile responsive design
			No errors, warnings, or notices in console
			Proper page layout (header, main section, footer)
			Manual SQL queries (no ORM)


📁 Project Structure
matcha-dating-app/
│
├── backend/                          # Express.js API
│   ├── config/                       # Configuration files
│   │   ├── db.js                    # Database connection
│   │   └── env.js                   # Environment helper
│   │
│   ├── controllers/                  # Business logic
│   │   ├── authController.js        # Authentication logic
│   │   ├── userController.js        # User profile operations
│   │   ├── matchController.js       # Matching & browsing logic
│   │   ├── chatController.js        # Chat operations
│   │   ├── notificationController.js # Notification handling
│   │   └── searchController.js      # Search & filtering
│   │
│   ├── middleware/                   # Request interceptors
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── validation.js            # Input validation
│   │   ├── errorHandler.js          # Error handling
│   │   └── uploadMiddleware.js      # File upload handling
│   │
│   ├── routes/                       # API endpoints
│   │   ├── authRoutes.js            # Authentication routes
│   │   ├── userRoutes.js            # User profile routes
│   │   ├── matchRoutes.js           # Matching routes
│   │   ├── chatRoutes.js            # Chat routes
│   │   ├── notificationRoutes.js    # Notification routes
│   │   └── searchRoutes.js          # Search routes
│   │
│   ├── models/                       # Database queries
│   │   ├── userModel.js             # User operations
│   │   ├── profileModel.js          # Profile operations
│   │   ├── likeModel.js             # Like/match operations
│   │   ├── chatModel.js             # Message operations
│   │   ├── notificationModel.js     # Notification operations
│   │   ├── tagModel.js              # Tag operations
│   │   └── visitModel.js            # Profile visit tracking
│   │
│   ├── utils/                        # Helper functions
│   │   ├── emailService.js          # Email sending
│   │   ├── tokenGenerator.js        # Token generation
│   │   ├── passwordUtils.js         # Password hashing
│   │   ├── geoLocation.js           # GPS handling
│   │   ├── fameRating.js            # Fame calculation
│   │   └── matchingAlgorithm.js     # Matching logic
│   │
│   ├── socket/                       # WebSocket handlers
│   │   ├── socketHandler.js         # Socket.io setup
│   │   └── chatSocket.js            # Real-time chat logic
│   │
│   ├── uploads/profiles/             # User uploaded files
│   ├── database/
│   │   ├── schema.sql               # Database tables
│   │   └── seeds.sql                # Test data (optional)
│   │
│   ├── docs/                         # Documentation
│   │
│   ├── .env                          # Environment variables
│   ├── .gitignore                    # Git ignore rules
│   ├── server.js                     # Main entry point
│   └── package.json                  # Dependencies
│
└── frontend/                         # Vue.js application
    ├── public/
    │   ├── index.html
    │   └── favicon.ico
    │
    ├── src/
    │   ├── assets/                   # Images, styles
    │   │   ├── images/
    │   │   └── styles/
    │   │
    │   ├── components/               # Reusable components
    │   │   ├── common/              # Header, Footer, Navbar
    │   │   ├── auth/                # Login, Register forms
    │   │   ├── profile/             # Profile components
    │   │   ├── browse/              # Browse components
    │   │   ├── chat/                # Chat components
    │   │   └── notifications/       # Notification components
    │   │
    │   ├── views/                    # Page components
    │   │   ├── Home.vue
    │   │   ├── Login.vue
    │   │   ├── Register.vue
    │   │   ├── Dashboard.vue
    │   │   ├── Profile.vue
    │   │   ├── EditProfile.vue
    │   │   ├── Browse.vue
    │   │   ├── Search.vue
    │   │   ├── UserProfile.vue
    │   │   ├── Chat.vue
    │   │   ├── Notifications.vue
    │   │   └── Settings.vue
    │   │
    │   ├── router/                   # Vue Router
    │   │   └── index.js
    │   │
    │   ├── store/                    # State management
    │   │   ├── index.js
    │   │   └── modules/
    │   │       ├── auth.js
    │   │       ├── user.js
    │   │       ├── notifications.js
    │   │       └── chat.js
    │   │
    │   ├── services/                 # API calls
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── userService.js
    │   │   ├── matchService.js
    │   │   ├── chatService.js
    │   │   └── socketService.js
    │   │
    │   ├── utils/                    # Helper functions
    │   │   ├── validators.js
    │   │   └── formatters.js
    │   │
    │   ├── App.vue
    │   └── main.js
    │
    ├── .env
    ├── .gitignore
    ├── package.json
    └── vite.config.js



🔧 Environment Configuration
Required Environment Variables (.env)

# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=              # Your MySQL password
DB_NAME=matcha_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=               # Generate with crypto.randomBytes(32).toString('hex')
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=               # Your email
EMAIL_PASSWORD=           # Gmail app password
EMAIL_FROM=Matcha Dating <noreply@matcha.com>

# Frontend Configuration
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads/profiles
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
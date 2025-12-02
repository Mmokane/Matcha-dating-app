-- Matcha Database schema 


-- drop exisitng table if its already exists 

DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS blocked_users;
DROP TABLE IF EXISTS profile_visits;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS user_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

-- 1. User Table Auth & Basic Info

CREATE TABLE users (
	id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,        -- Bcrypt hashed password
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,             -- Email verified?
    verification_token VARCHAR(255),            -- Token for email verification
    reset_token VARCHAR(255),                   -- Token for password reset
    reset_token_expires DATETIME,               -- When reset token expires
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_online BOOLEAN DEFAULT FALSE,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_verification_token (verification_token),
    INDEX idx_reset_token (reset_token)
);

-- 
CREATE TABLE profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    gender ENUM('male', 'female', 'other') NOT NULL,
    sexual_preference ENUM('men', 'women', 'both') DEFAULT 'both',
    biography TEXT,
    fame_rating INT DEFAULT 0,                  -- Calculated score
    latitude DECIMAL(10, 8),                    -- GPS: -90 to 90
    longitude DECIMAL(11, 8),                   -- GPS: -180 to 180
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_location (latitude, longitude)    -- Speed up location searches
);

-- ============================================
-- 3. PHOTOS TABLE - User Profile Pictures
-- ============================================
CREATE TABLE photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,             -- Stored file name
    is_profile_picture BOOLEAN DEFAULT FALSE,   -- Main profile photo?
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ============================================
-- 4. TAGS TABLE - Interest Tags (#vegan, #geek, etc.)
-- ============================================
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,           -- Tag name (without #)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
);

-- ============================================
-- 5. USER_TAGS TABLE - Links Users to Their Tags
-- Many-to-Many: One user has many tags, one tag has many users
-- ============================================
CREATE TABLE user_tags (
    user_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, tag_id),              -- Composite key (prevents duplicates)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_tag_id (tag_id)
);

-- ============================================
-- 6. LIKES TABLE - Who Liked Whom
-- ============================================
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    liker_id INT NOT NULL,                      -- User who liked
    liked_id INT NOT NULL,                      -- User being liked
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_like (liker_id, liked_id), -- One like per pair
    FOREIGN KEY (liker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (liked_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_liker (liker_id),
    INDEX idx_liked (liked_id)
);

-- ============================================
-- 7. MATCHES TABLE - Mutual Likes (Connections)
-- Created when two users like each other
-- ============================================
CREATE TABLE matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,                      -- First user
    user2_id INT NOT NULL,                      -- Second user
    matched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_match (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user1 (user1_id),
    INDEX idx_user2 (user2_id)
);

-- ============================================
-- 8. MESSAGES TABLE - Chat Messages Between Matches
-- ============================================
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,                           -- NULL = unread
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_sent_at (sent_at)                 -- For ordering messages
);

-- ============================================
-- 9. NOTIFICATIONS TABLE - Real-time Notifications
-- Types: like, view, message, match, unlike
-- ============================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,                       -- User receiving notification
    from_user_id INT,                           -- User who triggered it (can be NULL)
    type ENUM('like', 'view', 'message', 'match', 'unlike') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- 10. PROFILE_VISITS TABLE - Track Who Viewed Whose Profile
-- ============================================
CREATE TABLE profile_visits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visitor_id INT NOT NULL,                    -- User who visited
    visited_id INT NOT NULL,                    -- User being visited
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (visitor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (visited_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_visitor (visitor_id),
    INDEX idx_visited (visited_id),
    INDEX idx_visited_at (visited_at)
);

-- ============================================
-- 11. BLOCKED_USERS TABLE - User Blocking
-- ============================================
CREATE TABLE blocked_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blocker_id INT NOT NULL,                    -- User who blocked
    blocked_id INT NOT NULL,                    -- User being blocked
    blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_block (blocker_id, blocked_id),
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_blocker (blocker_id),
    INDEX idx_blocked (blocked_id)
);

-- ============================================
-- 12. REPORTS TABLE - Report Fake Accounts
-- ============================================
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,                   -- User who reported
    reported_id INT NOT NULL,                   -- User being reported
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reporter (reporter_id),
    INDEX idx_reported (reported_id)
);

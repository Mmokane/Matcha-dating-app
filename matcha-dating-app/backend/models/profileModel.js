// ============================================
// PROFILE MODEL
// Database queries for profile operations
// ============================================

const db = require('../config/db');

// Create profile for a user
// userId: number, profileData: { gender, sexual_preference, biography, latitude, longitude }
const createProfile = async (userId, profileData) => {
  try {
    const query = `
      INSERT INTO profiles (
        user_id, gender, sexual_preference, biography, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      userId,
      profileData.gender,
      profileData.sexual_preference || 'both',
      profileData.biography || null,
      profileData.latitude || null,
      profileData.longitude || null
    ];
    
    const [result] = await db.query(query, values);
    
    return {
      id: result.insertId,
      user_id: userId
    };
    
  } catch (error) {
    throw new Error('Error creating profile: ' + error.message);
  }
};

// Get profile by user ID
// userId: number
// Returns: profile object or null
const getProfileByUserId = async (userId) => {
  try {
    const query = 'SELECT * FROM profiles WHERE user_id = ?';
    const [rows] = await db.query(query, [userId]);
    
    return rows.length > 0 ? rows[0] : null;
    
  } catch (error) {
    throw new Error('Error getting profile: ' + error.message);
  }
};

// Update profile
// userId: number, profileData: object
// Returns: boolean (success)
const updateProfile = async (userId, profileData) => {
  try {
    const fields = [];
    const values = [];
    
    // Build dynamic update query based on provided fields
    if (profileData.gender !== undefined) {
      fields.push('gender = ?');
      values.push(profileData.gender);
    }
    
    if (profileData.sexual_preference !== undefined) {
      fields.push('sexual_preference = ?');
      values.push(profileData.sexual_preference);
    }
    
    if (profileData.biography !== undefined) {
      fields.push('biography = ?');
      values.push(profileData.biography);
    }
    
    if (profileData.latitude !== undefined && profileData.longitude !== undefined) {
      fields.push('latitude = ?, longitude = ?');
      values.push(profileData.latitude, profileData.longitude);
    }
    
    if (fields.length === 0) {
      return false; // Nothing to update
    }
    
    values.push(userId); // Add userId for WHERE clause
    
    const query = `UPDATE profiles SET ${fields.join(', ')} WHERE user_id = ?`;
    const [result] = await db.query(query, values);
    
    return result.affectedRows > 0;
    
  } catch (error) {
    throw new Error('Error updating profile: ' + error.message);
  }
};

// Update fame rating
// userId: number, rating: number
// Returns: boolean (success)
const updateFameRating = async (userId, rating) => {
  try {
    const query = 'UPDATE profiles SET fame_rating = ? WHERE user_id = ?';
    const [result] = await db.query(query, [rating, userId]);
    
    return result.affectedRows > 0;
    
  } catch (error) {
    throw new Error('Error updating fame rating: ' + error.message);
  }
};

// Add photo for user
// userId: number, filename: string, isProfilePicture: boolean
// Returns: photo object
const addPhoto = async (userId, filename, isProfilePicture = false) => {
  try {
    // If setting as profile picture, unset any existing profile picture
    if (isProfilePicture) {
      await db.query(
        'UPDATE photos SET is_profile_picture = FALSE WHERE user_id = ?',
        [userId]
      );
    }
    
    const query = `
      INSERT INTO photos (user_id, filename, is_profile_picture)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await db.query(query, [userId, filename, isProfilePicture]);
    
    return {
      id: result.insertId,
      user_id: userId,
      filename: filename,
      is_profile_picture: isProfilePicture
    };
    
  } catch (error) {
    throw new Error('Error adding photo: ' + error.message);
  }
};

// Get all photos for a user
// userId: number
// Returns: array of photo objects
const getUserPhotos = async (userId) => {
  try {
    const query = `
      SELECT * FROM photos 
      WHERE user_id = ? 
      ORDER BY is_profile_picture DESC, uploaded_at DESC
    `;
    const [rows] = await db.query(query, [userId]);
    
    return rows;
    
  } catch (error) {
    throw new Error('Error getting user photos: ' + error.message);
  }
};

// Get profile picture for user
// userId: number
// Returns: photo object or null
const getProfilePicture = async (userId) => {
  try {
    const query = `
      SELECT * FROM photos 
      WHERE user_id = ? AND is_profile_picture = TRUE
      LIMIT 1
    `;
    const [rows] = await db.query(query, [userId]);
    
    return rows.length > 0 ? rows[0] : null;
    
  } catch (error) {
    throw new Error('Error getting profile picture: ' + error.message);
  }
};

// Count photos for user
// userId: number
// Returns: number
const countUserPhotos = async (userId) => {
  try {
    const query = 'SELECT COUNT(*) as count FROM photos WHERE user_id = ?';
    const [rows] = await db.query(query, [userId]);
    
    return rows[0].count;
    
  } catch (error) {
    throw new Error('Error counting photos: ' + error.message);
  }
};

// Set photo as profile picture
// photoId: number, userId: number
// Returns: boolean (success)
const setProfilePicture = async (photoId, userId) => {
  try {
    // First, unset any existing profile picture
    await db.query(
      'UPDATE photos SET is_profile_picture = FALSE WHERE user_id = ?',
      [userId]
    );
    
    // Then set the new one
    const query = `
      UPDATE photos 
      SET is_profile_picture = TRUE 
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await db.query(query, [photoId, userId]);
    
    return result.affectedRows > 0;
    
  } catch (error) {
    throw new Error('Error setting profile picture: ' + error.message);
  }
};

// Delete photo
// photoId: number, userId: number
// Returns: photo object (to delete file) or null
const deletePhoto = async (photoId, userId) => {
  try {
    // Get photo info before deleting (need filename to delete file)
    const getQuery = 'SELECT * FROM photos WHERE id = ? AND user_id = ?';
    const [photos] = await db.query(getQuery, [photoId, userId]);
    
    if (photos.length === 0) {
      return null;
    }
    
    const photo = photos[0];
    
    // Delete from database
    const deleteQuery = 'DELETE FROM photos WHERE id = ? AND user_id = ?';
    await db.query(deleteQuery, [photoId, userId]);
    
    return photo;
    
  } catch (error) {
    throw new Error('Error deleting photo: ' + error.message);
  }
};

// Get complete profile with user info and photos
// userId: number
// Returns: complete profile object
const getCompleteProfile = async (userId) => {
  try {
    // Get user info
    const userQuery = `
      SELECT id, email, username, first_name, last_name, verified, 
             created_at, last_login, is_online
      FROM users 
      WHERE id = ?
    `;
    const [users] = await db.query(userQuery, [userId]);
    
    if (users.length === 0) {
      return null;
    }
    
    // Get profile info
    const profile = await getProfileByUserId(userId);
    
    // Get photos
    const photos = await getUserPhotos(userId);
    
    // Get tags
    const tagsQuery = `
      SELECT t.id, t.name 
      FROM tags t
      JOIN user_tags ut ON t.id = ut.tag_id
      WHERE ut.user_id = ?
    `;
    const [tags] = await db.query(tagsQuery, [userId]);
    
    return {
      ...users[0],
      profile: profile,
      photos: photos,
      tags: tags
    };
    
  } catch (error) {
    throw new Error('Error getting complete profile: ' + error.message);
  }
};

// Export all functions
module.exports = {
  createProfile,
  getProfileByUserId,
  updateProfile,
  updateFameRating,
  addPhoto,
  getUserPhotos,
  getProfilePicture,
  countUserPhotos,
  setProfilePicture,
  deletePhoto,
  getCompleteProfile
};
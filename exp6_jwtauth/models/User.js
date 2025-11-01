/**
 * User Model
 * 
 * This model defines the structure for user documents in MongoDB.
 * It includes fields for username, password (hashed), and role.
 * 
 * The password will be hashed using bcryptjs before saving to the database.
 * Roles can be either "admin" or "user" for role-based access control.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Pre-save middleware: Hash password before saving to database
 * 
 * This middleware runs before a user document is saved to the database.
 * It checks if the password has been modified, and if so, hashes it using bcryptjs.
 * This ensures that passwords are never stored in plain text.
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt (random data) to make the hash unique
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method: Compare password with hashed password
 * 
 * This method is used during login to verify if the provided password
 * matches the hashed password stored in the database.
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
module.exports = mongoose.model('User', userSchema);


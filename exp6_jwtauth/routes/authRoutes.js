/**
 * Authentication Routes
 * 
 * This file contains all authentication-related routes:
 * - POST /api/register - Register a new user
 * - POST /api/login - Login and receive JWT token
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * POST /api/register
 * 
 * Register a new user with username, password, and role.
 * 
 * Process:
 * 1. Validate input data (username, password, role)
 * 2. Check if username already exists
 * 3. Hash the password (handled by User model pre-save middleware)
 * 4. Save user to MongoDB
 * 5. Return success response
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
        error: 'Validation error'
      });
    }

    // Validate role if provided
    if (role && !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be either "admin" or "user"',
        error: 'Validation error'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists',
        error: 'Duplicate user'
      });
    }

    // Create new user
    // The password will be automatically hashed by the User model's pre-save middleware
    const user = new User({
      username: username.toLowerCase(),
      password: password,
      role: role || 'user' // Default to 'user' if not specified
    });

    // Save user to database
    await user.save();

    // Return success response (don't send password)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }

    // Handle other errors
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
});

/**
 * POST /api/login
 * 
 * Authenticate user and return JWT token.
 * 
 * Process:
 * 1. Find user by username
 * 2. Compare provided password with hashed password in database
 * 3. If valid, create JWT token containing user info
 * 4. Return token to client
 * 
 * The JWT token contains:
 * - userId: User's unique ID
 * - username: User's username
 * - role: User's role (admin or user)
 * 
 * Token expiration: 1 hour (configured in JWT_EXPIRES_IN or default)
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
        error: 'Validation error'
      });
    }

    // Find user by username (case-insensitive)
    const user = await User.findOne({ username: username.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Authentication failed'
      });
    }

    // Compare password with hashed password in database
    // This uses bcrypt.compare() to securely compare passwords
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Authentication failed'
      });
    }

    // Create JWT token payload
    // This data will be embedded in the token and can be decoded (but not tampered with)
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role
    };

    // Sign the token with secret key and set expiration
    // JWT_SECRET: Used to sign the token (must be kept secret)
    // expiresIn: Token expires after specified time (e.g., '1h' for 1 hour)
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Return success response with token
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error during login',
      error: error.message
    });
  }
});

// Note: /api/users route is handled in server.js with middleware

/**
 * GET /api/token/decode
 * 
 * Decode JWT token and show its contents
 * This helps understand what's inside a JWT token
 */
router.get('/token/decode', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        message: 'No token provided',
        error: 'Please provide a token in Authorization header'
      });
    }

    // Decode without verification (just to show contents)
    // In production, always verify tokens!
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      return res.status(400).json({
        message: 'Invalid token format',
        error: 'Token could not be decoded'
      });
    }

    // Also verify the token to show if it's valid
    let verified = null;
    let verificationError = null;
    try {
      verified = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      verificationError = err.message;
    }

    res.json({
      message: 'Token decoded successfully',
      token: {
        header: decoded.header,
        payload: decoded.payload,
        signature: '*** (verification only, not displayed for security) ***'
      },
      verification: {
        isValid: verified !== null,
        error: verificationError,
        expiresAt: decoded.payload.exp ? new Date(decoded.payload.exp * 1000).toISOString() : null,
        issuedAt: decoded.payload.iat ? new Date(decoded.payload.iat * 1000).toISOString() : null
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error decoding token',
      error: error.message
    });
  }
});

module.exports = router;


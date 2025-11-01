/**
 * Authentication Middleware
 * 
 * This middleware handles JWT token verification and role-based access control.
 * 
 * What is JWT (JSON Web Token)?
 * - JWT is a compact, URL-safe token format used to securely transmit information
 *   between parties as a JSON object.
 * - It consists of three parts: Header.Payload.Signature
 * - The signature ensures that the token hasn't been tampered with.
 * - Tokens are stateless, meaning the server doesn't need to store session data.
 * 
 * How JWT secures endpoints:
 * 1. User logs in → Server creates a JWT token containing user info (id, role)
 * 2. Client stores the token (usually in localStorage or cookie)
 * 3. Client sends token in Authorization header for protected routes
 * 4. Middleware verifies token signature and extracts user info
 * 5. Request proceeds only if token is valid
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token
 * 
 * How this middleware verifies tokens:
 * 1. Extracts token from Authorization header (format: "Bearer <token>")
 * 2. Verifies the token signature using the secret key (JWT_SECRET)
 * 3. If valid, decodes the token to get user information (id, role)
 * 4. Attaches user info to req.user for use in route handlers
 * 5. If invalid or missing, returns 401 Unauthorized
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token part

    // If no token provided, return error
    if (!token) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
        error: 'Authentication required'
      });
    }

    // Verify token using the secret key
    // jwt.verify() will:
    // 1. Check if token signature is valid
    // 2. Check if token has expired
    // 3. Decode the payload (user data) if valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token payload
    // This ensures the user still exists in the database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid token. User not found.',
        error: 'Authentication failed'
      });
    }

    // Attach user information to request object
    // This makes user data available in route handlers
    req.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Handle different types of errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token.',
        error: 'Token verification failed'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired. Please login again.',
        error: 'Token expired'
      });
    }

    // Other errors
    return res.status(500).json({
      message: 'Server error during authentication',
      error: error.message
    });
  }
};

/**
 * Middleware to check if user has admin role
 * 
 * How role-based access is enforced:
 * 1. This middleware MUST be used after authenticateToken
 * 2. It checks req.user.role (set by authenticateToken)
 * 3. If role is 'admin', request proceeds
 * 4. If role is not 'admin', returns 403 Forbidden
 * 
 * This ensures that only users with admin role can access admin-only routes.
 */
const authorizeAdmin = (req, res, next) => {
  // Check if user role is admin
  // req.user is set by the authenticateToken middleware
  if (req.user && req.user.role === 'admin') {
    next(); // Allow access
  } else {
    return res.status(403).json({
      message: 'Access denied. Admin role required.',
      error: 'Forbidden'
    });
  }
};

/**
 * Middleware to check if user has user role
 * This is optional but can be used for user-specific routes
 */
const authorizeUser = (req, res, next) => {
  if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
    // Allow both regular users and admins
    next();
  } else {
    return res.status(403).json({
      message: 'Access denied. User role required.',
      error: 'Forbidden'
    });
  }
};

// Export middleware functions
module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeUser
};


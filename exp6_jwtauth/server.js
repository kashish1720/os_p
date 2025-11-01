/**
 * Main Server File
 * 
 * This is the entry point of the Express application.
 * It sets up the Express server, connects to MongoDB, and configures routes.
 */

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const { authenticateToken, authorizeAdmin } = require('./middleware/authMiddleware');

// Initialize Express app
const app = express();

// Middleware configuration
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
// MongoDB connection string is stored in .env file as MONGODB_URI
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jwtauth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1); // Exit if database connection fails
});

// Health check route (no authentication required)
app.get('/api/health', (req, res) => {
  res.json({
    message: 'JWT Authentication API is running',
    endpoints: {
      register: 'POST /api/register',
      login: 'POST /api/login',
      userRoute: 'GET /api/user (requires authentication)',
      adminRoute: 'GET /api/admin (requires admin role)'
    }
  });
});

// Authentication routes (public)
// These routes don't require authentication
app.use('/api', authRoutes);

// Book routes
app.use('/api/books', bookRoutes);

/**
 * Protected Route: /api/user
 * 
 * This route is accessible to any authenticated user (both 'admin' and 'user' roles).
 * The authenticateToken middleware verifies the JWT token before allowing access.
 */
app.get('/api/user', authenticateToken, (req, res) => {
  // req.user is set by authenticateToken middleware
  res.json({
    message: 'Welcome! This is a protected user route.',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

/**
 * Protected Route: /api/admin
 * 
 * This route is accessible ONLY to users with 'admin' role.
 * 
 * Protection flow:
 * 1. authenticateToken middleware verifies JWT token and sets req.user
 * 2. authorizeAdmin middleware checks if req.user.role === 'admin'
 * 3. If both pass, the route handler executes
 * 4. If either fails, an error response is returned
 */
app.get('/api/admin', authenticateToken, authorizeAdmin, (req, res) => {
  // This code only executes if:
  // 1. Token is valid (authenticateToken passed)
  // 2. User role is 'admin' (authorizeAdmin passed)
  res.json({
    message: 'Welcome Admin! This is a protected admin-only route.',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

/**
 * Protected Route: /api/users (Admin only)
 * 
 * Get all users from database (excluding passwords)
 * This helps visualize the database contents for understanding the experiment
 */
app.get('/api/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({
      message: 'Users retrieved successfully',
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Catch all handler: send back React's index.html file for client-side routing
// Use '/*' instead of '*' because newer path-to-regexp versions error on a lone '*'
// Catch-all: use app.use without a path so Express won't parse it with path-to-regexp
app.use((req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      message: 'Route not found',
      path: req.path
    });
  }
  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});


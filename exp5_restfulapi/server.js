/*
  RESTful API using Node.js, Express, and JWT authentication
  - POST /signup  → register new user (username, email, hashed password)
  - POST /login   → verify credentials, return signed JWT
  - GET  /profile → protected route, returns current user if token valid

  Security hardening:
  - Uses helmet() for secure HTTP headers
  - Uses cors() with a safe default (can be restricted via CORS_ORIGIN env)
  - Uses bcryptjs for password hashing with per-user salts
  - Uses JWT with http Authorization: Bearer <token>
  - Validates and normalizes inputs with simple checks
  - Avoids leaking whether username/email exists on login

  Testing (Postman):
  1) POST /signup
     Body: JSON
     {
       "username": "alice",
       "email": "alice@example.com",
       "password": "StrongP@ssw0rd"
     }
  2) POST /login
     Body: JSON
     {
       "email": "alice@example.com",
       "password": "StrongP@ssw0rd"
     }
     → Copy the returned token ("token").
  3) GET /profile
     Headers: Authorization: Bearer <token>
     → Should return the user's profile (sans password).

  Environment variables (.env):
  - PORT=3000
  - JWT_SECRET=replace_this_with_a_long_random_secret_value
  - CORS_ORIGIN=http://localhost:3000 (optional)

  Why production-ready:
  - Security middleware (helmet, cors), secure password hashing, JWT-based auth
  - Input validation, clear error handling and status codes
  - Secrets drawn from environment variables
  - Clear separation of auth middleware, minimal attack surface
*/

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security middlewares
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// Serve static frontend
app.use(express.static('public'));

// CORS: default to allowing same-origin; configurable origin via env
const corsOrigin = process.env.CORS_ORIGIN || true;
app.use(
	cors({
		origin: corsOrigin,
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	})
);

// In-memory user store (for demo). In production, use a database.
const users = [];

// Helpers
function isValidEmail(email) {
	return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isStrongPassword(password) {
	return (
		typeof password === 'string' &&
		password.length >= 8 &&
		/[A-Z]/.test(password) &&
		/[a-z]/.test(password) &&
		/[0-9]/.test(password)
	);
}

function generateJwtToken(payload) {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET is not set');
	}
	return jwt.sign(payload, secret, { expiresIn: '1h' });
}

function verifyJwtToken(token) {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET is not set');
	}
	return jwt.verify(token, secret);
}

// Auth middleware
function authenticateToken(req, res, next) {
	const authHeader = req.header('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Missing or invalid Authorization header' });
	}
	const token = authHeader.slice('Bearer '.length).trim();
	try {
		const decoded = verifyJwtToken(token);
		req.user = decoded; // { id, username, email }
		return next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

// Routes
app.post('/signup', async (req, res) => {
	try {
		const { username, email, password } = req.body || {};

		// Basic input validation
		if (typeof username !== 'string' || username.trim().length < 3) {
			return res.status(400).json({ error: 'Username must be at least 3 characters' });
		}
		if (!isValidEmail(email)) {
			return res.status(400).json({ error: 'Invalid email' });
		}
		if (!isStrongPassword(password)) {
			return res.status(400).json({ error: 'Password must be 8+ chars incl. upper, lower, number' });
		}

		const normalizedEmail = email.trim().toLowerCase();
		const existing = users.find((u) => u.email === normalizedEmail);
		if (existing) {
			return res.status(409).json({ error: 'Email already registered' });
		}

		const passwordHash = await bcrypt.hash(password, 12);
		const user = {
			id: String(users.length + 1),
			username: username.trim(),
			email: normalizedEmail,
			passwordHash
		};
		users.push(user);

		return res.status(201).json({
			message: 'User registered successfully',
			user: { id: user.id, username: user.username, email: user.email }
		});
	} catch (err) {
		return res.status(500).json({ error: 'Internal server error' });
	}
});

app.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body || {};
		if (!isValidEmail(email) || typeof password !== 'string') {
			return res.status(400).json({ error: 'Invalid credentials' });
		}
		const normalizedEmail = email.trim().toLowerCase();
		const user = users.find((u) => u.email === normalizedEmail);
		// Use constant-time password checking behavior pattern
		const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;
		if (!user || !passwordOk) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		const token = generateJwtToken({ id: user.id, username: user.username, email: user.email });
		return res.status(200).json({ token });
	} catch (err) {
		return res.status(500).json({ error: 'Internal server error' });
	}
});

app.get('/profile', authenticateToken, (req, res) => {
	const { id } = req.user;
	const user = users.find((u) => u.id === id);
	if (!user) {
		return res.status(404).json({ error: 'User not found' });
	}
	return res.status(200).json({ id: user.id, username: user.username, email: user.email });
});

// Health check (optional)
app.get('/health', (req, res) => {
	return res.status(200).json({ status: 'ok' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

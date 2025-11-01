# JWT Authentication with Role-Based Access Control

A complete full-stack authentication system using Node.js, Express, MongoDB, and JWT (JSON Web Token) with role-based access control.

## Features

- ✅ User Registration with role assignment
- ✅ User Login with JWT token generation
- ✅ Password hashing using bcryptjs
- ✅ JWT token-based authentication
- ✅ Protected routes with middleware
- ✅ Role-based access control (Admin & User)
- ✅ Token expiration handling

## Project Structure

```
exp6_jwtauth/
├── models/
│   └── User.js              # User schema with password hashing
├── middleware/
│   └── authMiddleware.js    # JWT verification and role authorization
├── routes/
│   └── authRoutes.js        # Register and login routes
├── server.js                # Main Express server
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env` file:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Optionally set `PORT` and `JWT_EXPIRES_IN`

3. Start MongoDB (if using local MongoDB):
   - Make sure MongoDB is running on your system

## Running the Application

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Public Routes

#### 1. Register User
```http
POST /api/register
Content-Type: application/json

{
  "username": "john",
  "password": "password123",
  "role": "user"  // optional: "admin" or "user" (default: "user")
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "username": "john",
    "role": "user"
  }
}
```

#### 2. Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "john",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "john",
    "role": "user"
  }
}
```

### Protected Routes

#### 3. User Route (Any authenticated user)
```http
GET /api/user
Authorization: Bearer <token>
```

#### 4. Admin Route (Admin only)
```http
GET /api/admin
Authorization: Bearer <token>
```

## Testing with cURL or Postman

1. **Register a user:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","role":"user"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

3. **Access protected route (copy token from login response):**
```bash
curl -X GET http://localhost:5000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

4. **Access admin route:**
```bash
curl -X GET http://localhost:5000/api/admin \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

## Security Features

- Passwords are hashed using bcryptjs before storing
- JWT tokens are signed with a secret key
- Tokens expire after a specified time (default: 1 hour)
- Role-based access control for different user types
- Token verification middleware protects routes

## License

ISC


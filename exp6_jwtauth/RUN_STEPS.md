# Step-by-Step Guide to Run the JWT Authentication Project

## Step 1: Verify Prerequisites ✅

### Check if Node.js is installed:
```powershell
node --version
```
You should see a version number (e.g., v18.x.x or higher)

### Check if npm is installed:
```powershell
npm --version
```
You should see a version number (e.g., 9.x.x or higher)

---

## Step 2: Check MongoDB Connection 🔌

### Option A: Using Local MongoDB

**Check if MongoDB is running:**
```powershell
# On Windows, check MongoDB service
Get-Service MongoDB
```

**If MongoDB is not running, start it:**
```powershell
# Start MongoDB service
Start-Service MongoDB

# OR if MongoDB is installed as a service:
net start MongoDB
```

**If MongoDB is not installed, you can:**
1. Download and install MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. OR use MongoDB Atlas (cloud) - see Option B below

### Option B: Using MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/jwtauth`)
4. Update the `.env` file with your Atlas connection string

---

## Step 3: Configure Environment Variables ⚙️

### Update the `.env` file:

1. Open the `.env` file in your project root
2. Make sure it has the following content:

```env
# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/jwtauth

# JWT Secret Key (for production, use a longer random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_minimum_32_characters

# JWT Token Expiration Time
JWT_EXPIRES_IN=1h

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

**Important:**
- If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string
- For production, generate a secure JWT_SECRET using:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

---

## Step 4: Install Dependencies (if not already done) 📦

```powershell
npm install
```

This will install:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- nodemon (dev dependency)

---

## Step 5: Start the Server 🚀

### For Development (with auto-reload):
```powershell
npm run dev
```

### OR For Production:
```powershell
npm start
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 Server is running on http://localhost:5000
📝 Environment: development
```

**If you see errors:**
- ❌ MongoDB connection error → Make sure MongoDB is running (Step 2)
- ❌ Port already in use → Change PORT in `.env` file or stop other services on port 5000

---

## Step 6: Test the API 🧪

### Test 1: Check if server is running

Open browser or use PowerShell:
```powershell
curl http://localhost:5000
```

**Expected Response:**
```json
{
  "message": "JWT Authentication API is running",
  "endpoints": {
    "register": "POST /api/register",
    "login": "POST /api/login",
    "userRoute": "GET /api/user (requires authentication)",
    "adminRoute": "GET /api/admin (requires admin role)"
  }
}
```

---

### Test 2: Register a User

**Using PowerShell (Invoke-RestMethod):**
```powershell
$body = @{
    username = "testuser"
    password = "password123"
    role = "user"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/register" -Method Post -Body $body -ContentType "application/json"
```

**OR using curl (if available):**
```powershell
curl -X POST http://localhost:5000/api/register `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"testuser\",\"password\":\"password123\",\"role\":\"user\"}'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "username": "testuser",
    "role": "user"
  }
}
```

---

### Test 3: Register an Admin User

```powershell
$body = @{
    username = "admin"
    password = "admin123"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/register" -Method Post -Body $body -ContentType "application/json"
```

---

### Test 4: Login and Get Token

```powershell
$body = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

**Save the token** - you'll need it for the next steps!

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "testuser",
    "role": "user"
  }
}
```

---

### Test 5: Access Protected User Route

Replace `YOUR_TOKEN_HERE` with the token from Step 4:

```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/user" -Method Get -Headers $headers
```

**Expected Response:**
```json
{
  "message": "Welcome! This is a protected user route.",
  "user": {
    "id": "...",
    "username": "testuser",
    "role": "user"
  },
  "timestamp": "2024-..."
}
```

---

### Test 6: Access Admin Route (Should Fail for Regular User)

```powershell
$token = "YOUR_REGULAR_USER_TOKEN"
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/admin" -Method Get -Headers $headers
```

**Expected Response (403 Forbidden):**
```json
{
  "message": "Access denied. Admin role required.",
  "error": "Forbidden"
}
```

---

### Test 7: Access Admin Route (With Admin Token)

First, login as admin:
```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/login" -Method Post -Body $body -ContentType "application/json"
$adminToken = $adminResponse.token
```

Then access admin route:
```powershell
$headers = @{
    Authorization = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/admin" -Method Get -Headers $headers
```

**Expected Response:**
```json
{
  "message": "Welcome Admin! This is a protected admin-only route.",
  "user": {
    "id": "...",
    "username": "admin",
    "role": "admin"
  },
  "timestamp": "2024-..."
}
```

---

## Step 7: Using Postman (Alternative Testing Tool) 📬

1. **Download Postman** from https://www.postman.com/downloads/

2. **Register a User:**
   - Method: `POST`
   - URL: `http://localhost:5000/api/register`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "username": "testuser",
       "password": "password123",
       "role": "user"
     }
     ```

3. **Login:**
   - Method: `POST`
   - URL: `http://localhost:5000/api/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "username": "testuser",
       "password": "password123"
     }
     ```
   - Copy the token from the response

4. **Access Protected Routes:**
   - Method: `GET`
   - URL: `http://localhost:5000/api/user` (or `/api/admin`)
   - Headers:
     - `Authorization: Bearer YOUR_TOKEN_HERE`

---

## Troubleshooting 🔧

### Issue: MongoDB Connection Error
**Solution:**
- Make sure MongoDB is running (Step 2)
- Check if the connection string in `.env` is correct
- For MongoDB Atlas, make sure your IP is whitelisted

### Issue: Port Already in Use
**Solution:**
- Change `PORT=5000` to another port in `.env` (e.g., `PORT=3000`)
- Or stop the service using port 5000

### Issue: Module Not Found
**Solution:**
- Run `npm install` again
- Make sure you're in the project directory

### Issue: Invalid Token Error
**Solution:**
- Make sure you're copying the full token
- Tokens expire after 1 hour (configurable in `.env`)
- Login again to get a new token

---

## Quick Start Summary 🎯

```powershell
# 1. Navigate to project
cd D:\fsd_prac\exp6_jwtauth

# 2. Install dependencies (if not done)
npm install

# 3. Start MongoDB (if local)
Start-Service MongoDB

# 4. Start server
npm run dev

# 5. Test in another terminal
curl http://localhost:5000
```

---

## Success Indicators ✅

Your project is running correctly if:
- ✅ Server starts without errors
- ✅ "Connected to MongoDB" message appears
- ✅ You can register a user successfully
- ✅ You can login and receive a token
- ✅ You can access protected routes with a valid token
- ✅ Admin routes reject regular users (403 error)
- ✅ Admin routes accept admin users

---

## Next Steps 🚀

- Try creating a frontend (HTML/React) to consume these APIs
- Add more routes and features
- Implement token refresh mechanism
- Add logging and monitoring


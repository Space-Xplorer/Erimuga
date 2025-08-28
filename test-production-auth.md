# Production Authentication Test Guide

Follow these steps to test and debug the authentication system:

## 🧪 Step-by-Step Testing

### 1. **Deploy the Updated Backend**
- Push the latest changes to your repository
- Wait for Render to deploy the updates
- Check the logs to ensure the server starts without errors

### 2. **Test Basic Server Health**
```bash
curl https://erimuga-backend.onrender.com/health
```
Expected: Server status with CORS and environment info

### 3. **Test Session Endpoint (No Auth)**
```bash
curl https://erimuga-backend.onrender.com/user/auth/check-session
```
Expected: Session info showing no authentication

### 4. **Test Registration**
```bash
curl -X POST https://erimuga-backend.onrender.com/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "userType": "user"
  }'
```
Expected: User created successfully

### 5. **Test Login**
```bash
curl -X POST https://erimuga-backend.onrender.com/user/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://erimuga-frontend.onrender.com" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```
Expected: Login successful with session

### 6. **Test Session Validation (After Login)**
```bash
curl https://erimuga-backend.onrender.com/user/auth/check-session \
  -b cookies.txt \
  -H "Origin: https://erimuga-frontend.onrender.com"
```
Expected: Session info showing user is authenticated

### 7. **Test Orders Endpoint (With Auth)**
```bash
curl https://erimuga-backend.onrender.com/orders/user/test@example.com \
  -b cookies.txt \
  -H "Origin: https://erimuga-frontend.onrender.com"
```
Expected: Orders data or empty array

## 🔍 What to Look For in Logs

### Server Logs Should Show:
```
🔍 POST /user/auth/login
  - Session ID: [some-id]
  - Session exists: true
  - User authenticated: true
  - User: [user-id]
  - Cookies: Present
  - Origin: https://erimuga-frontend.onrender.com

📝 Session created in MongoDB: [session-id]
🔐 Passport serializeUser called for user: [user-id]
✅ User logged in successfully: [user-id]
✅ Session saved successfully
```

### Orders Request Should Show:
```
🔍 GET /orders/user/[user-id]
  - Session ID: [same-session-id]
  - Session exists: true
  - User authenticated: true
  - User: [user-id]
  - Cookies: Present
  - Origin: https://erimuga-frontend.onrender.com

🔒 isLoggedIn middleware check:
✅ isLoggedIn: User is authenticated, proceeding...
```

## 🐛 Common Issues and Solutions

### Issue 1: Session Not Being Created
**Symptoms**: No "Session created in MongoDB" log
**Solution**: Check SESSION_SECRET environment variable

### Issue 2: Session Not Being Maintained
**Symptoms**: Session exists during login but not during orders request
**Solution**: Check cookie settings and CORS configuration

### Issue 3: Passport Not Deserializing User
**Symptoms**: User authenticated but req.user is null
**Solution**: Check passport deserialization and MongoDB connection

### Issue 4: CORS Blocking Cookies
**Symptoms**: Cookies not being sent with requests
**Solution**: Verify CORS origin and credentials settings

## 📱 Frontend Testing

1. **Open your frontend** in a new incognito window
2. **Register a new user** or login with existing user
3. **Click the "🧪 Test Session" button** in UserDashboard
4. **Check browser console** for session test results
5. **Try to access orders** and check for errors

## 🔧 Debugging Commands

### Check MongoDB Sessions Collection
```bash
# Connect to your MongoDB Atlas
mongosh "your-connection-string"

# Check sessions collection
use erimuga
db.sessions.find().pretty()
```

### Check Server Logs in Render
- Go to your Render dashboard
- Click on your backend service
- Check the "Logs" tab for real-time logs

## 📊 Expected Flow

1. **Login Request** → Session Created → User Authenticated
2. **Session Validation** → Session Found → User Data Returned
3. **Orders Request** → Session Validated → Orders Data Returned

## 🚨 If Still Getting 401 Errors

1. **Check if session exists in MongoDB**
2. **Verify cookie is being sent** (check browser dev tools)
3. **Check CORS configuration** matches your frontend URL
4. **Verify SESSION_SECRET** is set correctly
5. **Check if passport.deserializeUser** is being called

## 📞 Next Steps

If the issue persists after these tests:
1. Share the server logs from the testing steps
2. Share the browser console logs
3. Share the MongoDB sessions collection data
4. Check if the issue is specific to the orders endpoint or all authenticated endpoints

# Production Deployment Guide

This guide will help you deploy your EriMuga e-commerce website to production platforms like Render, Vercel, or Railway.

## 🚀 Quick Deployment Checklist

- [ ] Set `NODE_ENV=production` in your environment
- [ ] Update `BASE_URL` to your production backend URL
- [ ] Update `FRONTEND_URL` to your production frontend URL
- [ ] Use a strong, unique `SESSION_SECRET`
- [ ] Enable HTTPS (production platforms do this automatically)
- [ ] Configure proper CORS origins for production
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure Google OAuth for production domains

## 🔧 Environment Variables for Production

### Backend (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB Configuration (Use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erimuga

# Session Configuration (CHANGE THIS!)
SESSION_SECRET=your-super-secret-production-session-key-here

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Base URLs (Production URLs)
BASE_URL=https://erimuga-backend.onrender.com
FRONTEND_URL=https://erimuga-frontend.onrender.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env)
```env
VITE_BASE_URL=https://erimuga-backend.onrender.com
VITE_APP_NAME=EriMuga
```

## 🌐 Platform-Specific Deployment

### Render (Backend)

1. **Connect your GitHub repository**
2. **Create a new Web Service**
3. **Configure the service:**
   - **Name**: `erimuga-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server`

4. **Set Environment Variables:**
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `SESSION_SECRET`: Strong secret key
   - `BASE_URL`: `https://erimuga-backend.onrender.com`
   - `FRONTEND_URL`: `https://erimuga-frontend.onrender.com`
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

5. **Deploy and note the URL**

### Vercel (Frontend)

1. **Connect your GitHub repository**
2. **Create a new project**
3. **Configure the project:**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variables:**
   - `VITE_BASE_URL`: Your Render backend URL
   - `VITE_APP_NAME`: `EriMuga`

5. **Deploy and note the URL**

## 🔐 Google OAuth Production Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project**
3. **Go to APIs & Services > Credentials**
4. **Edit your OAuth 2.0 Client ID**
5. **Add Authorized redirect URIs:**
   - `https://erimuga-backend.onrender.com/user/auth/google/callback`
6. **Add Authorized JavaScript origins:**
   - `https://erimuga-frontend.onrender.com`
7. **Save changes**

## 🗄️ MongoDB Atlas Setup

1. **Create a MongoDB Atlas account**
2. **Create a new cluster**
3. **Set up database access:**
   - Create a database user with read/write permissions
   - Note the username and password
4. **Set up network access:**
   - Allow access from anywhere (0.0.0.0/0) for production
5. **Get your connection string:**
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/erimuga`

## 🧪 Testing Production Deployment

### 1. Test Backend Health
```bash
curl https://erimuga-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "Server is running",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "cors": {
    "allowedOrigins": ["Production URLs"],
    "isProduction": true
  }
}
```

### 2. Test Authentication Flow
1. Visit your frontend URL
2. Try to register a new user
3. Try to login
4. Check if session persists after page refresh
5. Try to access protected routes

### 3. Test CORS
Open browser console and check for CORS errors when making requests.

## 🐛 Common Production Issues

### 1. Session Not Persisting
**Symptoms**: User gets logged out after page refresh
**Solutions**:
- Check if `SESSION_SECRET` is set
- Verify MongoDB connection
- Check cookie settings in browser dev tools
- Ensure `secure: true` is set for HTTPS

### 2. CORS Errors
**Symptoms**: Requests blocked with CORS errors
**Solutions**:
- Verify `FRONTEND_URL` in backend environment
- Check if frontend URL is in allowed origins
- Ensure `credentials: true` is set in CORS config

### 3. 401 Unauthorized Errors
**Symptoms**: API calls return 401 even after login
**Solutions**:
- Check if sessions are being created in MongoDB
- Verify cookie domain and path settings
- Check if `withCredentials: true` is set in frontend requests

### 4. MongoDB Connection Issues
**Symptoms**: Database connection errors
**Solutions**:
- Verify MongoDB Atlas connection string
- Check network access settings
- Ensure database user has correct permissions

## 📊 Monitoring and Debugging

### 1. Backend Logs
Check Render logs for:
- Session creation/deletion
- Authentication attempts
- CORS blocked requests
- Database connection issues

### 2. Frontend Console
Check browser console for:
- CORS errors
- Authentication errors
- Network request failures

### 3. Database Monitoring
Monitor MongoDB Atlas for:
- Connection counts
- Query performance
- Session storage

## 🔒 Security Checklist

- [ ] `SESSION_SECRET` is strong and unique
- [ ] HTTPS is enabled
- [ ] CORS origins are restricted to production domains
- [ ] Database user has minimal required permissions
- [ ] Google OAuth redirect URIs are production URLs
- [ ] No sensitive data in client-side code
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are configured

## 🚨 Emergency Rollback

If something goes wrong:

1. **Revert to previous deployment** in your platform
2. **Check environment variables** are correct
3. **Verify database connectivity**
4. **Check CORS configuration**
5. **Review recent changes** in your code

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set correctly
3. Test the authentication flow step by step
4. Check browser console for errors
5. Verify MongoDB Atlas connectivity

## 🎯 Next Steps After Deployment

1. **Set up monitoring** (Uptime Robot, Pingdom)
2. **Configure error tracking** (Sentry, LogRocket)
3. **Set up analytics** (Google Analytics, Mixpanel)
4. **Configure backups** for your database
5. **Set up SSL certificates** if not automatic
6. **Configure CDN** for static assets
7. **Set up logging** aggregation

---

**Remember**: Always test thoroughly in a staging environment before deploying to production!

# EriMuga - E-commerce Website

A full-stack e-commerce website built with React, Node.js, MongoDB, and Passport.js for authentication.

## Features

- 🔐 **Secure Authentication**: Local and Google OAuth authentication with Passport.js
- 🛒 **Shopping Cart**: Persistent cart with MongoDB storage
- 📱 **Responsive Design**: Modern UI built with Tailwind CSS
- 🔒 **Session Management**: Secure session handling with MongoDB sessions
- 👨‍💼 **Admin Panel**: Product and order management for administrators
- 💳 **Order Management**: Complete order processing system

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Passport.js (Local + Google OAuth)
- Express Sessions with MongoDB Store
- Multer for file uploads
- Cloudinary for image storage

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google OAuth credentials (for Google login)

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd erimuga
```

### 2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Server (.env)
Create a `.env` file in the `server` directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/erimuga

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here-change-in-production

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Base URLs
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Cloudinary Configuration (if using)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Client (.env)
Create a `.env` file in the `client` directory:
```env
VITE_BASE_URL=http://localhost:3000
VITE_APP_NAME=EriMuga
```

### 4. Database Setup
Make sure MongoDB is running and accessible. The application will automatically create the necessary collections.

### 5. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/user/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### 6. Start the application

#### Start the server
```bash
cd server
npm start
```

#### Start the client (in a new terminal)
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Authentication Flow

1. **Local Authentication**: Users can register and login with email/password
2. **Google OAuth**: Users can login with their Google account
3. **Session Persistence**: Sessions are stored in MongoDB and persist across browser restarts
4. **Protected Routes**: Certain routes require authentication

## API Endpoints

### Authentication
- `POST /user/auth/register` - User registration
- `POST /user/auth/login` - User login
- `POST /user/auth/logout` - User logout
- `GET /user/auth/me` - Get current user
- `GET /user/auth/validate-session` - Validate session

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID

### Cart
- `GET /cart/get?userId=:id` - Get user's cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/update` - Update cart item quantity
- `DELETE /cart/remove` - Remove item from cart
- `DELETE /cart/clear` - Clear user's cart

### Orders
- `POST /orders/create` - Create new order
- `GET /orders/:userId` - Get user's orders

## Troubleshooting

### Session Not Persisting
1. Check if `SESSION_SECRET` is set in your `.env` file
2. Ensure MongoDB is running and accessible
3. Check browser console for CORS errors
4. Verify cookie settings in browser developer tools

### Authentication Issues
1. Check server logs for authentication errors
2. Verify Google OAuth credentials
3. Ensure `withCredentials: true` is set in frontend requests
4. Check if sessions are being created in MongoDB

### CORS Issues
1. Verify `FRONTEND_URL` in server `.env`
2. Check CORS configuration in `server.js`
3. Ensure frontend is running on the correct port

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Update `BASE_URL` and `FRONTEND_URL` to production URLs
3. Use a strong, unique `SESSION_SECRET`
4. Enable HTTPS and set `secure: true` in session config
5. Configure proper CORS origins for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

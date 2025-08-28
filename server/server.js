import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import session from 'express-session';
import passport from 'passport';
import MongoStore from "connect-mongo";
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/mongodb.js';
import './config/cloudinary.js';  // Cloudinary config is imported and executed automatically
import './config/passport.js';

import userAuthRoutes from './routes/userAuth.js';
import productRouter from './routes/product.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/orders.js';
import adminRoutes from './routes/adminRoutes.js';
import metadataRoutes from './routes/metaDataRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Environment variables (no need for baseUrl.js file)
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Connect to MongoDB
await connectDB();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// ✅ CORS setup - Enhanced for production
const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = isProd 
  ? [FRONTEND_URL, "https://erimuga-frontend.onrender.com", "https://erimuga.vercel.app"]
  : [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  // ✅ Enhanced CORS settings for cookies
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client public directory
app.use(express.static('../client/public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins,
      isProduction: isProd
    }
  });
});

// ✅ Sessions - Enhanced for production
const mongoStore = MongoStore.create({ 
  mongoUrl: process.env.MONGODB_URI,
  collectionName: 'sessions',
  ttl: 24 * 60 * 60, // 1 day in seconds
  autoRemove: 'native'
});

// ✅ Add session store debugging
mongoStore.on('create', (sessionId) => {
  console.log('📝 Session created in MongoDB:', sessionId);
});

mongoStore.on('touch', (sessionId) => {
  console.log('👆 Session touched in MongoDB:', sessionId);
});

mongoStore.on('destroy', (sessionId) => {
  console.log('🗑️ Session destroyed in MongoDB:', sessionId);
});

mongoStore.on('error', (error) => {
  console.error('❌ MongoDB session store error:', error);
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: '/',
    domain: undefined, // Let the browser set the domain
    // ✅ Enhanced cookie settings for cross-origin
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  name: 'erimuga.sid',
  // ✅ Enhanced session settings
  rolling: true, // Extend session on each request
  unset: 'destroy'
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Session debugging middleware (only in development)
if (!isProd) {
  app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('User authenticated:', req.isAuthenticated());
    console.log('User:', req.user ? req.user._id : 'No user');
    next();
  });
}

// ✅ Enhanced session debugging middleware for all environments
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path}`);
  console.log('  - Session ID:', req.sessionID);
  console.log('  - Session exists:', !!req.session);
  console.log('  - User authenticated:', req.isAuthenticated());
  console.log('  - User:', req.user ? req.user._id : 'No user');
  console.log('  - Cookies:', req.headers.cookie ? 'Present' : 'Missing');
  console.log('  - Origin:', req.headers.origin);
  next();
});

// Routes
app.use("/user/auth", userAuthRoutes);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/admin", adminRoutes);
app.use("/metadata", metadataRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err.stack);
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Error', 
      message: 'Origin not allowed',
      allowedOrigins: isProd ? ['Production URLs'] : allowedOrigins
    });
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at ${BASE_URL}`);
  console.log(`✅ Frontend URL: ${FRONTEND_URL}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Session Secret: ${process.env.SESSION_SECRET ? 'Set' : 'Not set'}`);
  console.log(`✅ MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
  console.log(`✅ CORS Origins: ${allowedOrigins.join(', ')}`);
});


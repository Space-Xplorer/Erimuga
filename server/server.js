import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import session from 'express-session';
import passport from 'passport';
import MongoStore from "connect-mongo";
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// ✅ Fix for path-to-regexp DEBUG_URL issue
// Remove any DEBUG_URL that might cause path-to-regexp errors
if (process.env.DEBUG_URL) {
  delete process.env.DEBUG_URL;
  console.log('🛡️ Removed problematic DEBUG_URL environment variable');
}

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
const PORT = process.env.PORT || 10000; // ✅ Use port 10000 for Render

// ✅ Environment variables
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const isProd = process.env.NODE_ENV === 'production';

// Connect to MongoDB
await connectDB();

// ✅ Production optimizations
if (isProd) {
  app.set('trust proxy', 1); // Trust Render proxy
}

// ✅ Compression middleware for better performance
app.use(compression());

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
    },
  },
}));

// ✅ Enhanced logging for production
app.use(morgan(isProd ? 'combined' : 'dev'));

// ✅ Enhanced rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 100 : 1000, // Stricter in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ✅ Enhanced CORS setup for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'https://erimuga.onrender.com', // Production frontend
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // ✅ Essential for session cookies
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client public directory
app.use(express.static('../client/public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // ✅ Only secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ✅ Lax for development
  }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/user/auth", userAuthRoutes);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/admin", adminRoutes);
app.use("/metadata", metadataRoutes);

// ✅ Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'EriMuga API Server',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Enhanced global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Don't leak error details in production
  const message = isProd ? 'Internal server error' : err.message;
  const stack = isProd ? undefined : err.stack;
  
  res.status(err.status || 500).json({
    success: false,
    error: message,
    stack: stack
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at ${BASE_URL}`);
  console.log(`📱 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});


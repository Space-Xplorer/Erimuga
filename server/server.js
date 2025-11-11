// ✅ CRITICAL: Handle environment variables properly
import dotenv from 'dotenv';
dotenv.config();

delete process.env.DEBUG_URL;
delete process.env.DEBUG;

console.log('🛡️ Cleaned environment variables');

// ✅ Imports
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import MongoStore from "connect-mongo";
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import connectDB from './config/mongodb.js';
import './config/cloudinary.js';
import './config/passport.js';

import userAuthRoutes from './routes/userAuth.js';
import productRouter from './routes/product.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/orders.js';
import adminRoutes from './routes/adminRoutes.js';
import metadataRoutes from './routes/metaDataRoutes.js';

// ✅ Basic setup
const app = express();
const PORT = process.env.PORT || 10000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const isProd = process.env.NODE_ENV === 'production';

// ✅ Connect to MongoDB
await connectDB();

// ✅ Trust proxy if behind load balancer (Render)
if (isProd) app.set('trust proxy', 1);

// ✅ Performance & security middlewares
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      // ✅ Added frontend dev URL
      connectSrc: ["'self'", "http://localhost:5173", "https://api.cloudinary.com"],
    },
  },
}));
app.use(morgan(isProd ? 'combined' : 'dev'));

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 100 : 1000,
  message: { error: 'Too many requests, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ✅ CORS setup
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://erimuga-frontend.onrender.com', // Production frontend on Render
  // New .com domains
  'https://www.erindmuga.com',    
  'https://erindmuga.com',        
  'http://www.erindmuga.com',     
  'http://erindmuga.com',         
  // Keep .in temporarily during migration
  'https://www.erindmuga.in',
  'https://erindmuga.in',
  'http://www.erindmuga.in',
  'http://erindmuga.in'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    const msg = 'CORS policy blocked this origin.';
    return callback(new Error(msg), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // ✅ Needed for session cookies
  optionsSuccessStatus: 200
}));

// ✅ Body parsers & cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Serve static files
app.use(express.static('../client/public'));

// ✅ Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Server running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    cors: { allowedOrigins, isProduction: isProd }
  });
});

// ✅ SINGLE MongoStore instance (fix)
const mongoStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: 'sessions',
  ttl: 24 * 60 * 60,
  autoRemove: 'native'
});

// ✅ Debug store events
mongoStore.on('create', id => console.log('📝 Session created in MongoDB:', id));
mongoStore.on('touch', id => console.log('👆 Session touched in MongoDB:', id));
mongoStore.on('destroy', id => console.log('🗑️ Session destroyed in MongoDB:', id));
mongoStore.on('error', err => console.error('❌ MongoDB session store error:', err));

// ✅ Session setup (fixed to use shared store)
app.use(session({
  name: 'erimuga.sid',
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,              // ✅ must be false for stable sessions
  saveUninitialized: false,   // ✅ prevents empty sessions
  store: mongoStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: isProd,                  // HTTPS only in prod
    sameSite: isProd ? 'none' : 'lax',
  }
}));

// ✅ Passport setup (must be AFTER session)
app.use(passport.initialize());
app.use(passport.session());

// ✅ Debugging middleware
if (!isProd) {
  app.use((req, res, next) => {
    console.log('🧠 Debug Session:', {
      id: req.sessionID,
      authenticated: req.isAuthenticated(),
      user: req.user?.email || 'none',
      cookies: req.headers.cookie ? 'present' : 'missing',
    });
    next();
  });
}

// ✅ Routes
app.use("/user/auth", userAuthRoutes);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/admin", adminRoutes);
app.use("/metadata", metadataRoutes);

// ✅ Global health & info
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
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

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  const message = isProd ? 'Internal server error' : err.message;
  res.status(err.status || 500).json({
    success: false,
    error: message,
    stack: isProd ? undefined : err.stack,
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at ${BASE_URL}`);
  console.log(`✅ Frontend URL: ${FRONTEND_URL}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Session Secret: ${process.env.SESSION_SECRET ? 'Set' : 'Not set'}`);
  console.log(`✅ MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
});

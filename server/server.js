// // ✅ CRITICAL: Handle environment variables properly to prevent path-to-regexp errors
// import dotenv from 'dotenv';
// dotenv.config();

// // Remove any problematic DEBUG_URL that might be set by external tools or dependencies
// delete process.env.DEBUG_URL;
// delete process.env.DEBUG;

// console.log('🛡️ Cleaned environment variables');

// import express from 'express';
// import cors from 'cors';
// import session from 'express-session';
// import passport from 'passport';
// import MongoStore from "connect-mongo";
// import helmet from 'helmet';
// import morgan from 'morgan';
// import rateLimit from 'express-rate-limit';
// import compression from 'compression';



// import connectDB from './config/mongodb.js';
// import './config/cloudinary.js';  // Cloudinary config is imported and executed automatically
// import './config/passport.js';

// import userAuthRoutes from './routes/userAuth.js';
// import productRouter from './routes/product.js';
// import cartRouter from './routes/cart.js';
// import orderRouter from './routes/orders.js';
// import adminRoutes from './routes/adminRoutes.js';
// import metadataRoutes from './routes/metaDataRoutes.js';

// const app = express();
// const PORT = process.env.PORT || 10000; // ✅ Use port 10000 for Render

// // ✅ Environment variables
// const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
// const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// const isProd = process.env.NODE_ENV === 'production';

// // Connect to MongoDB
// await connectDB();

// // ✅ Production optimizations
// if (isProd) {
//   app.set('trust proxy', 1); // Trust Render proxy
// }

// // ✅ Compression middleware for better performance
// app.use(compression());

// // Security headers
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com"],
//       imgSrc: ["'self'", "data:", "https:", "http:"],
//       scriptSrc: ["'self'"],
//       connectSrc: ["'self'", "https://api.cloudinary.com"],
//     },
//   },
// }));

// // ✅ Enhanced logging for production
// app.use(morgan(isProd ? 'combined' : 'dev'));

// // ✅ Enhanced rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: isProd ? 100 : 1000, // Stricter in production
//   message: {
//     error: 'Too many requests from this IP, please try again later.',
//     retryAfter: 15 * 60 * 1000
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// // ✅ Enhanced CORS setup for production with custom domain
// const allowedOrigins = [
//   FRONTEND_URL,
//   'http://localhost:5173',
//   'http://localhost:3000',
//   'https://erimuga.onrender.com', // Production frontend on Render
//   'https://www.erindmuga.in',     // ✅ Custom domain
//   'https://erindmuga.in',         // ✅ Root domain
//   'http://www.erindmuga.in',      // ✅ HTTP version (for development)
//   'http://erindmuga.in'           // ✅ HTTP root domain
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (mobile apps, Postman, etc.)
//     if (!origin) return callback(null, true);
    
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
    
//     const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//     return callback(new Error(msg), false);
//   },
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true, // ✅ Essential for session cookies
//   optionsSuccessStatus: 200
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files from the client public directory
// app.use(express.static('../client/public'));

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'Server is running',
//     environment: process.env.NODE_ENV,
//     timestamp: new Date().toISOString(),
//     cors: {
//       allowedOrigins,
//       isProduction: isProd
//     }
//   });
// });

// // ✅ Sessions - Enhanced for production
// const mongoStore = MongoStore.create({ 
//   mongoUrl: process.env.MONGODB_URI,
//   collectionName: 'sessions',
//   ttl: 24 * 60 * 60, // 1 day in seconds
//   autoRemove: 'native'
// });

// // ✅ Add session store debugging
// mongoStore.on('create', (sessionId) => {
//   console.log('📝 Session created in MongoDB:', sessionId);
// });

// mongoStore.on('touch', (sessionId) => {
//   console.log('👆 Session touched in MongoDB:', sessionId);
// });

// mongoStore.on('destroy', (sessionId) => {
//   console.log('🗑️ Session destroyed in MongoDB:', sessionId);
// });

// mongoStore.on('error', (error) => {
//   console.error('❌ MongoDB session store error:', error);
// });

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'fallback-secret-key',
//   resave: false, // Critical for production
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
//   cookie: {
//     maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production', // ✅ Only secure in production
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ✅ Lax for development
//   }
// }));

// // Passport Middleware
// app.use(passport.initialize());
// app.use(passport.session());

// // ✅ Session debugging middleware (only in development)
// if (!isProd) {
//   app.use((req, res, next) => {
//     console.log('Session ID:', req.sessionID);
//     console.log('User authenticated:', req.isAuthenticated());
//     console.log('User:', req.user ? req.user._id : 'No user');
//     next();
//   });
// }

// // ✅ Enhanced session debugging middleware for all environments
// app.use((req, res, next) => {
//   console.log(`🔍 ${req.method} ${req.path}`);
//   console.log('  - Session ID:', req.sessionID);
//   console.log('  - Session exists:', !!req.session);
//   console.log('  - User authenticated:', req.isAuthenticated());
//   console.log('  - User:', req.user ? req.user._id : 'No user');
//   console.log('  - Cookies:', req.headers.cookie ? 'Present' : 'Missing');
//   console.log('  - Origin:', req.headers.origin);
//   next();
// });

// // Routes
// app.use("/user/auth", userAuthRoutes);
// app.use("/products", productRouter);
// app.use("/cart", cartRouter);
// app.use("/orders", orderRouter);
// app.use("/admin", adminRoutes);
// app.use("/metadata", metadataRoutes);

// // ✅ Health check endpoint for monitoring
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// app.get('/', (req, res) => {
//   res.json({
//     message: 'EriMuga API Server',
//     version: '1.0.0',
//     status: 'running',
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // ✅ Enhanced global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
  
//   // Don't leak error details in production
//   const message = isProd ? 'Internal server error' : err.message;
//   const stack = isProd ? undefined : err.stack;
  
//   res.status(err.status || 500).json({
//     success: false,
//     error: message,
//     stack: stack
//   });
// });

// // ✅ 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     error: `Route ${req.originalUrl} not found`
//   });
// });

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`✅ Server running at ${BASE_URL}`);
//   console.log(`✅ Frontend URL: ${FRONTEND_URL}`);
//   console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`✅ Session Secret: ${process.env.SESSION_SECRET ? 'Set' : 'Not set'}`);
//   console.log(`✅ MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
// });




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
  'https://erimuga.onrender.com', // Production frontend on Render
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

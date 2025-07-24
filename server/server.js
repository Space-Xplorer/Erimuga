import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import session from 'express-session';
import passport from 'passport';
import MongoStore from "connect-mongo";

import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import './config/passport.js';

import userAuthRoutes from './routes/userAuth.js';
import productRouter from './routes/product.js';
import cartRouter
 from './routes/cart.js';
const app = express();
const PORT = process.env.PORT || 3000;
await connectDB();
await connectCloudinary();

app.use(cors());
app.use(express.json());


 // Load Passport strategies
app.use(session({
  secret: "your-session-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions"
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/user/auth", userAuthRoutes);
app.use("/products", productRouter);
app.use("/cart", cartRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



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
import cartRouter from './routes/cart.js';
import orderRouter from './routes/orders.js'; // Uncomment if you have order routes
const app = express();
const PORT = process.env.PORT || 3000;
await connectDB();
await connectCloudinary();

app.use(cors({
  origin: 'http://localhost:5173', // Adjust this to the client URL
  credentials: true
}));
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
app.use("/orders", orderRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



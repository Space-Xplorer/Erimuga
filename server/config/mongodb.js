// config/mongodb.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Optional: tune selection timeout to fail fast if Atlas is blocked
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    // Good hygiene: log errors and close cleanly on shutdown
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: "email",
}, async (email, password, done) => {
  try {
    const user = await userModel.findOne({ email });
    if (!user) return done(null, false, { message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false, { message: "Incorrect password" });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/user/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        name: profile.displayName,
        email,
        googleId: profile.id,
        password: await bcrypt.hash(profile.id, 10), // dummy password
      });
    } else if (!user.googleId) {
      // If user exists but hasn't linked Google yet
      user.googleId = profile.id;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Session handling
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;

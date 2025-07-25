import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for OAuth users
  googleId: { type: String }, // to store Google OAuth ID
  cartData: { type: Object, default: {} },
  
  // ✅ New field for user role/type
  userType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }

}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;

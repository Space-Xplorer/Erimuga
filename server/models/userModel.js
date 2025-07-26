import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for OAuth users
  googleId: { type: String }, // to store Google OAuth ID
  usertype: { type: String, default: 'user' }, // 'user' or 'admin'
  cartData: {
  type: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
      priceAtPurchase: { type: Number }, // optional - snapshot price
      size: { type: String },            // optional - if applicable
      color: { type: String },           // optional - if applicable
    }
  ],
  default: []
},
  
  // ✅ New field for user role/type
  userType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }

}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;

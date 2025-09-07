import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phonenumber: { type: String, unique: true, sparse: true }, 
  password: { type: String }, // optional for OAuth users
  googleId: { type: String }, // to store Google OAuth ID
  addresses: {
    type: [addressSchema],
    default: []
  },
  cartData: {
    type: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceAtPurchase: { type: Number },
        size: { type: String },
        color: { type: String },
        productCode: { type: String, required: true },
      }
    ],
    default: []
  },
  userType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }

}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;

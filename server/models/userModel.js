import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  recipientName: { type: String },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  postalCode: { type: String, required: true },
  phonenumber: { type: String },
  landmark: { type: String },
  addressType: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phonenumber: { type: String, unique: true, sparse: true },
  password: { type: String },
  googleId: { type: String },
  addresses: { type: [addressSchema], default: [] },
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
  },

  // DPDP right to erasure. On account deletion the personal fields above are
  // scrubbed and this is set, so the row survives only as a non-identifying
  // tombstone that keeps retained order records referentially intact. Login is
  // blocked while true.
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;

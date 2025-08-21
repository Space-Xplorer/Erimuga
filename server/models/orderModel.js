// import mongoose from 'mongoose';

// const orderSchema = new mongoose.Schema({
//   userID: { type: String, required: true },

//   items: [
//     {
//       productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//       quantity: { type: Number, required: true }
//     }
//   ],

//   amount: { type: Number, required: true },

//   address: {
//     street: String,
//     city: String,
//     state: String,
//     zip: String,
//     country: String
//   },

//   status: { type: String, required: true, default: 'Order Placed' },

//   paymentMethod: { type: String, required: true },

//   // ✅ Added defaults for consistency
//   paymentStatus: { 
//     type: String, 
//     trim: true, 
//     enum: ['pending', 'paid', 'failed'], 
//     default: 'pending' 
//   },

//   payment: { type: Boolean, required: true, default: false },

//   // ✅ Better handling for date
//   date: { type: Date, default: Date.now }
// });

// // Always check if model already exists to avoid overwrite error in dev
// const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// export default Order;


import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userID: { type: String, required: true },

  items: [
    {
      productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true }
    }
  ],

  amount: { type: Number, required: true },

  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },

  // ✅ Add phone field
  phone: { type: String, required: true },

  status: { type: String, required: true, default: 'Order Placed' },

  paymentMethod: { type: String, required: true },

  paymentStatus: { 
    type: String, 
    trim: true, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },

  payment: { type: Boolean, required: true, default: false },

  date: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;

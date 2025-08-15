// import User from '../models/userModel.js';
// import asyncHandler from 'express-async-handler';
// import { generateToken } from '../utils/generateToken.js';

// // ... existing functions ...

// export const updateUserProfile = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   const { action, address, addressId } = req.body;

//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     switch(action) {
//       case 'update-profile':
//         user.name = req.body.name || user.name;
//         user.email = req.body.email || user.email;
//         user.phonenumber = req.body.phoneNumber || user.phonenumber;
//         break;

//       case 'add':
//         if (address) {
//           user.addresses.push(address);
//           // Set first address as default if none exists
//           if (user.addresses.length === 1) {
//             user.addresses[0].isDefault = true;
//           }
//         }
//         break;

//       case 'update':
//         if (addressId && address) {
//           const addrIndex = user.addresses.findIndex(a => a._id.toString() === addressId);
//           if (addrIndex !== -1) {
//             user.addresses[addrIndex] = address;
//           }
//         }
//         break;

//       case 'delete':
//         if (addressId) {
//           user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);
//           // If default was deleted, set new default
//           if (user.addresses.length > 0 && 
//               !user.addresses.some(a => a.isDefault)) {
//             user.addresses[0].isDefault = true;
//           }
//         }
//         break;

//       case 'set-default':
//         if (addressId) {
//           user.addresses.forEach(addr => {
//             addr.isDefault = addr._id.toString() === addressId;
//           });
//         }
//         break;

//       default:
//         return res.status(400).json({ message: 'Invalid action' });
//     }

//     const updatedUser = await user.save();

//     res.json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       phonenumber: updatedUser.phonenumber,
//       addresses: updatedUser.addresses,
//       token: generateToken(updatedUser._id)
//     });
//   } catch (error) {
//     console.error('Profile update error:', error);
//     res.status(500).json({ message: 'Profile update failed' });
//   }
// });

// export const getUserProfile = asyncHandler(async (req, res) => {
//   const userId = req.params.userId;
  
//   try {
//     const user = await User.findById(userId).select('-password -googleId');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json(user);
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ message: 'Error fetching profile' });
//   }
// });
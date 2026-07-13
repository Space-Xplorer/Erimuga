import express from 'express';
import { isLoggedIn, isAdmin } from '../middlewares/auth.js';
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/couponController.js';

const couponRouter = express.Router();

couponRouter.post('/validate', isLoggedIn, validateCoupon);

couponRouter.get('/', isLoggedIn, isAdmin, getAllCoupons);
couponRouter.post('/', isLoggedIn, isAdmin, createCoupon);
couponRouter.put('/:id', isLoggedIn, isAdmin, updateCoupon);
couponRouter.delete('/:id', isLoggedIn, isAdmin, deleteCoupon);

export default couponRouter;

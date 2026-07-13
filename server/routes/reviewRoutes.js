import express from 'express';
import { isLoggedIn, isAdmin } from '../middlewares/auth.js';
import { createReview, getProductReviews, deleteReview } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

reviewRouter.get('/product/:productId', getProductReviews);
reviewRouter.post('/', isLoggedIn, createReview);
reviewRouter.delete('/:id', isLoggedIn, isAdmin, deleteReview);

export default reviewRouter;

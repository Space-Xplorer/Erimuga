import Review from '../models/reviewModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!productId || !rating) return res.status(400).json({ error: 'Product and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Check for verified purchase (any delivered order containing this product)
    const verifiedOrder = await Order.findOne({
      userID: userId.toString(),
      status: 'Delivered',
      'items.productID': productId,
    });

    const existing = await Review.findOne({ productId, userId });
    if (existing) return res.status(409).json({ error: 'You have already reviewed this product' });

    const review = new Review({
      productId,
      userId,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment || '',
      verifiedPurchase: !!verifiedOrder,
    });

    await review.save();

    // Update cached avgRating on Product
    await updateProductRating(productId);

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'You have already reviewed this product' });
    res.status(500).json({ error: 'Failed to submit review', details: err.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    await updateProductRating(review.productId);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review', details: err.message });
  }
};

const updateProductRating = async (productId) => {
  const agg = await Review.aggregate([
    { $match: { productId: productId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  await Product.findByIdAndUpdate(productId, { avgRating: Math.round(avg * 10) / 10, reviewCount: count });
};

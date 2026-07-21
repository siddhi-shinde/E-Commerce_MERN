const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/productModel');

// @desc Add a review to a product (customer only, one review per product)
// @route POST /api/reviews/addReview/:id
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }
  if (!comment || !comment.trim()) {
    return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const alreadyReviewed = product.reviews.find((r) => r.user_id.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
  }

  product.reviews.push({ user_id: req.user._id, rating, comment });
  await product.save();

  res.status(201).json({ success: true, message: 'Review added successfully', reviews: product.reviews });
});

// @desc Get reviews for a product
// @route GET /api/reviews/getReviews/:id
const getReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user_id', 'name profileImage');
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.status(200).json({
    success: true,
    count: product.reviews.length,
    averageRating: product.averageRating,
    reviews: product.reviews,
  });
});

// @desc Update own review
// @route PUT /api/reviews/updateReview/:id/:reviewId
const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  if (review.user_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'You can only update your own review' });
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    review.rating = rating;
  }
  if (comment !== undefined) review.comment = comment;

  await product.save();

  res.status(200).json({ success: true, message: 'Review updated successfully', reviews: product.reviews });
});

// @desc Delete a review (own review, or any review if admin)
// @route DELETE /api/reviews/deleteReview/:id/:reviewId
const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const isOwner = review.user_id.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ success: false, message: 'You can only delete your own review' });
  }

  review.deleteOne();
  await product.save();

  res.status(200).json({ success: true, message: 'Review deleted successfully', reviews: product.reviews });
});

module.exports = { addReview, getReviews, updateReview, deleteReview };

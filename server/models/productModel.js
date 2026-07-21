const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      unique: true,
      trim: true,
    },
    description: { type: String, required: [true, 'Description is required'] },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand is required'],
    },
    price: {
      type: Number,
      required: true,
      min: [0.01, 'Price must be greater than zero'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100'],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    mainImage: { type: String, required: [true, 'Main image is required'] },
    productImages: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

// Keep isAvailable in sync with stock whenever the document is saved directly
productSchema.pre('save', function (next) {
  this.isAvailable = this.quantity > 0;
  next();
});

// Virtual: final price after discount -> Price - (Price * Discount / 100)
productSchema.virtual('finalPrice').get(function () {
  const discountAmount = (this.price * this.discount) / 100;
  return Number((this.price - discountAmount).toFixed(2));
});

// Virtual: average rating -> Total Rating / Total Number of Reviews
productSchema.virtual('averageRating').get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  return Number((total / this.reviews.length).toFixed(1));
});

productSchema.virtual('totalReviews').get(function () {
  return this.reviews ? this.reviews.length : 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);

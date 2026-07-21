const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/productModel');

// @desc Create product (Admin or Vendor)
// @route POST /api/products/createProduct
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category_id, brand_id, price, discount, quantity } = req.body;

  const existing = await Product.findOne({ name });
  if (existing) {
    return res.status(400).json({ success: false, message: 'A product with this name already exists' });
  }

  if (!req.files || !req.files.mainImage) {
    return res.status(400).json({ success: false, message: 'Main image is required' });
  }

  const mainImage = `/uploads/products/${req.files.mainImage[0].filename}`;
  const productImages = req.files.productImages
    ? req.files.productImages.map((file) => `/uploads/products/${file.filename}`)
    : [];

  const product = await Product.create({
    name,
    description,
    category_id,
    brand_id,
    price,
    discount: discount || 0,
    quantity: quantity || 0,
    mainImage,
    productImages,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Product created successfully', product });
});

// @desc Get all products (paginated)
// @route GET /api/products/getAllProducts?page=1&limit=10
const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Product.countDocuments();
  const products = await Product.find()
    .populate('category_id', 'categoryName')
    .populate('brand_id', 'brandName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    products,
  });
});

// @desc Get single product by ID
// @route GET /api/products/getProductById/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category_id', 'categoryName')
    .populate('brand_id', 'brandName')
    .populate('reviews.user_id', 'name profileImage');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.status(200).json({ success: true, product });
});

// @desc Update product (Admin, or the Vendor who owns it)
// @route PUT /api/products/updateProduct/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const isOwner = product.createdBy.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ success: false, message: 'You can only update your own products' });
  }

  const editableFields = ['name', 'description', 'category_id', 'brand_id', 'price', 'discount', 'quantity', 'isFeatured'];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.files && req.files.mainImage) {
    product.mainImage = `/uploads/products/${req.files.mainImage[0].filename}`;
  }
  if (req.files && req.files.productImages) {
    product.productImages = req.files.productImages.map((file) => `/uploads/products/${file.filename}`);
  }

  product.updatedBy = req.user._id;

  await product.save();

  res.status(200).json({ success: true, message: 'Product updated successfully', product });
});

// @desc Delete product (Admin, or the Vendor who owns it)
// @route DELETE /api/products/deleteProduct/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const isOwner = product.createdBy.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ success: false, message: 'You can only delete your own products' });
  }

  await product.deleteOne();

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({ category_id: req.params.id, isAvailable: true });
  res.status(200).json({ success: true, count: products.length, products });
});

const getProductsByBrand = asyncHandler(async (req, res) => {
  const products = await Product.find({ brand_id: req.params.id, isAvailable: true });
  res.status(200).json({ success: true, count: products.length, products });
});

const getProductsByVendor = asyncHandler(async (req, res) => {
  const products = await Product.find({ createdBy: req.params.id });
  res.status(200).json({ success: true, count: products.length, products });
});

// @desc Logged-in vendor's own products
// @route GET /api/products/getMyProducts
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: products.length, products });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isAvailable: true }).limit(20);
  res.status(200).json({ success: true, count: products.length, products });
});

const getLatestProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isAvailable: true }).sort({ createdAt: -1 }).limit(20);
  res.status(200).json({ success: true, count: products.length, products });
});

const getTopRatedProducts = asyncHandler(async (req, res) => {
  const products = await Product.aggregate([
    { $match: { isAvailable: true } },
    {
      $addFields: {
        averageRating: {
          $cond: [{ $gt: [{ $size: '$reviews' }, 0] }, { $avg: '$reviews.rating' }, 0],
        },
      },
    },
    { $sort: { averageRating: -1 } },
    { $limit: 20 },
  ]);

  res.status(200).json({ success: true, count: products.length, products });
});

// @desc Search products by name, description, brand name, category name
// @route GET /api/products/search?query=laptop
const searchProducts = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ success: false, message: 'Search query is required' });
  }

  const regex = new RegExp(query, 'i');

  const products = await Product.find({ isAvailable: true })
    .populate('category_id', 'categoryName')
    .populate('brand_id', 'brandName');

  const filtered = products.filter(
    (p) =>
      regex.test(p.name) ||
      regex.test(p.description) ||
      (p.brand_id && regex.test(p.brand_id.brandName)) ||
      (p.category_id && regex.test(p.category_id.categoryName))
  );

  res.status(200).json({ success: true, count: filtered.length, products: filtered });
});

// @desc Filter products
// @route GET /api/products/filter?category=&brand=&minPrice=&maxPrice=&rating=
const filterProducts = asyncHandler(async (req, res) => {
  const { category, brand, minPrice, maxPrice, rating } = req.query;

  const filter = { isAvailable: true };
  if (category) filter.category_id = category;
  if (brand) filter.brand_id = brand;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let products = await Product.find(filter);

  if (rating) {
    products = products.filter((p) => p.averageRating >= Number(rating));
  }

  res.status(200).json({ success: true, count: products.length, products });
});

// @desc Sort products
// @route GET /api/products/sort?sortBy=price&order=asc
const sortProducts = asyncHandler(async (req, res) => {
  const { sortBy, order } = req.query;
  const sortOrder = order === 'desc' ? -1 : 1;

  let sortQuery = { createdAt: -1 };

  switch (sortBy) {
    case 'price':
      sortQuery = { price: sortOrder };
      break;
    case 'newest':
      sortQuery = { createdAt: -1 };
      break;
    case 'oldest':
      sortQuery = { createdAt: 1 };
      break;
    case 'discount':
      sortQuery = { discount: -1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }

  let products = await Product.find({ isAvailable: true }).sort(sortQuery);

  if (sortBy === 'rating') {
    products = products.sort((a, b) => b.averageRating - a.averageRating);
  }

  res.status(200).json({ success: true, count: products.length, products });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByBrand,
  getProductsByVendor,
  getMyProducts,
  getFeaturedProducts,
  getLatestProducts,
  getTopRatedProducts,
  searchProducts,
  filterProducts,
  sortProducts,
};

const asyncHandler = require('../utils/asyncHandler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { buildCartSummary } = require('../services/cartService');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    cart = await Cart.create({ user_id: userId, products: [] });
  }
  return cart;
};

// @desc Add product to cart
// @route POST /api/cart/addToCart
const addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Valid product_id and quantity are required' });
  }

  const product = await Product.findById(product_id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  if (!product.isAvailable) {
    return res.status(400).json({ success: false, message: 'Product is currently not available' });
  }

  const cart = await getOrCreateCart(req.user._id);

  const existingItem = cart.products.find((p) => p.product_id.toString() === product_id);
  const requestedQuantity = existingItem ? existingItem.quantity + Number(quantity) : Number(quantity);

  if (requestedQuantity > product.quantity) {
    return res.status(400).json({ success: false, message: `Only ${product.quantity} units of this product are in stock` });
  }

  // Same product should not appear twice - increase quantity if it already exists
  if (existingItem) {
    existingItem.quantity = requestedQuantity;
  } else {
    cart.products.push({ product_id, quantity: Number(quantity) });
  }

  await cart.save();

  res.status(200).json({ success: true, message: 'Product added to cart', cart });
});

// @desc Get logged in user's cart with calculated totals
// @route GET /api/cart/getCart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user_id: req.user._id }).populate('products.product_id');

  if (!cart || cart.products.length === 0) {
    return res.status(200).json({
      success: true,
      cart: {
        items: [],
        itemTotal: 0,
        itemDiscount: 0,
        subtotal: 0,
        totalDiscount: 0,
        finalCartAmount: 0,
        totalProducts: 0,
        totalQuantity: 0,
      },
    });
  }

  const summary = buildCartSummary(cart);

  res.status(200).json({ success: true, cart: summary });
});

const changeQuantity = async (req, res, delta) => {
  const cart = await Cart.findOne({ user_id: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const item = cart.products.find((p) => p.product_id.toString() === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Product not found in cart' });
  }

  const product = await Product.findById(req.params.id);
  const newQuantity = item.quantity + delta;

  if (newQuantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity cannot be less than 1' });
  }
  if (product && newQuantity > product.quantity) {
    return res.status(400).json({ success: false, message: `Only ${product.quantity} units are in stock` });
  }

  item.quantity = newQuantity;
  await cart.save();

  res.status(200).json({ success: true, message: 'Cart updated', cart });
};

// @desc Increase quantity by 1
// @route PUT /api/cart/increaseQuantity/:id
const increaseQuantity = asyncHandler(async (req, res) => changeQuantity(req, res, 1));

// @desc Decrease quantity by 1
// @route PUT /api/cart/decreaseQuantity/:id
const decreaseQuantity = asyncHandler(async (req, res) => changeQuantity(req, res, -1));

// @desc Set exact quantity
// @route PUT /api/cart/updateQuantity/:id
const updateQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  const cart = await Cart.findOne({ user_id: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const item = cart.products.find((p) => p.product_id.toString() === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Product not found in cart' });
  }

  const product = await Product.findById(req.params.id);
  if (product && quantity > product.quantity) {
    return res.status(400).json({ success: false, message: `Only ${product.quantity} units are in stock` });
  }

  item.quantity = Number(quantity);
  await cart.save();

  res.status(200).json({ success: true, message: 'Cart updated', cart });
});

// @desc Remove product from cart
// @route DELETE /api/cart/removeProduct/:id
const removeProduct = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user_id: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  cart.products = cart.products.filter((p) => p.product_id.toString() !== req.params.id);
  await cart.save();

  res.status(200).json({ success: true, message: 'Product removed from cart', cart });
});

// @desc Clear entire cart
// @route DELETE /api/cart/clearCart
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user_id: req.user._id });
  if (cart) {
    cart.products = [];
    await cart.save();
  }

  res.status(200).json({ success: true, message: 'Cart cleared successfully' });
});

module.exports = {
  addToCart,
  getCart,
  increaseQuantity,
  decreaseQuantity,
  updateQuantity,
  removeProduct,
  clearCart,
};

const asyncHandler = require('../utils/asyncHandler');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const { buildOrderFromCart } = require('../services/orderService');
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../services/emailService');

// @desc Place a new order from the logged-in customer's cart
// @route POST /api/orders/placeOrder
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user_id: req.user._id }).populate('products.product_id');

  if (!cart || cart.products.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }

  // Validate stock for every product before placing the order
  for (const item of cart.products) {
    const product = item.product_id;
    if (!product || !product.isAvailable) {
      return res.status(400).json({ success: false, message: `${product ? product.name : 'A product'} is no longer available` });
    }
    if (item.quantity > product.quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.quantity} units of ${product.name} are in stock` });
    }
  }

  const { products, subtotal, discountAmount, deliveryCharge, totalAmount } = buildOrderFromCart(cart);

  const order = await Order.create({
    user_id: req.user._id,
    products,
    shippingAddress,
    subtotal,
    discountAmount,
    deliveryCharge,
    totalAmount,
    paymentMethod,
    paymentStatus: 'pending',
    orderStatus: 'placed',
  });

  // Reduce stock for each ordered product
  for (const item of cart.products) {
    const updated = await Product.findByIdAndUpdate(
      item.product_id._id,
      { $inc: { quantity: -item.quantity } },
      { new: true }
    );
    if (updated && updated.quantity <= 0) {
      updated.isAvailable = false;
      await updated.save();
    }
  }

  // Clear the cart after order placement
  cart.products = [];
  await cart.save();

  await sendOrderConfirmationEmail(req.user, order);

  res.status(201).json({ success: true, message: 'Order placed successfully', order });
});

// @desc Get logged in user's orders
// @route GET /api/orders/getMyOrders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user_id: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc Get order by ID (owner or admin)
// @route GET /api/orders/getOrderById/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const isOwner = order.user_id.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ success: false, message: 'You are not authorized to view this order' });
  }

  res.status(200).json({ success: true, order });
});

// @desc Cancel an eligible order (owner only, not delivered/cancelled already)
// @route PUT /api/orders/cancelOrder/:id
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const isOwner = order.user_id.toString() === req.user._id.toString();
  if (!isOwner) {
    return res.status(403).json({ success: false, message: 'You can only cancel your own orders' });
  }

  if (['delivered', 'cancelled'].includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      message: `Order cannot be cancelled as it is already ${order.orderStatus}`,
    });
  }

  // Restore stock for each product in the order
  for (const item of order.products) {
    await Product.findByIdAndUpdate(item.product_id, {
      $inc: { quantity: item.quantity },
      isAvailable: true,
    });
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  await order.save();

  await sendOrderStatusEmail(req.user, order);

  res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
});

// @desc Get all orders (admin only)
// @route GET /api/orders/getAllOrders
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc Update order status (admin only)
// @route PUT /api/orders/updateOrderStatus/:id
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const validStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

  if (!validStatuses.includes(orderStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid order status' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.orderStatus = orderStatus;
  if (orderStatus === 'delivered') order.deliveredAt = new Date();
  if (orderStatus === 'cancelled') order.cancelledAt = new Date();

  await order.save();

  const orderOwner = await User.findById(order.user_id);
  if (orderOwner) {
    await sendOrderStatusEmail(orderOwner, order);
  }

  res.status(200).json({ success: true, message: 'Order status updated', order });
});

// @desc Get orders that contain the logged-in vendor's products
// @route GET /api/orders/getVendorOrders
const getVendorOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'products.vendor_id': req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, orders });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getVendorOrders,
};

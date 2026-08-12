const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const razorpayInstance = require('../config/razorpay');
const Cart = require('../models/cartModel');
const { buildOrderFromCart, validateCartStock, createOrderFromCart } = require('../services/orderService');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// @desc Create a Razorpay order for the logged-in customer's current cart.
//       The amount is always computed from the cart on the server — never
//       trust an amount sent by the client.
// @route POST /api/payments/createOrder
const createRazorpayOrder = asyncHandler(async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user_id: req.user._id,
    }).populate("products.product_id");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    await validateCartStock(cart);

    const { totalAmount } = buildOrderFromCart(cart);
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
      },
    });

    return res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @desc Verify the Razorpay payment signature returned by Checkout, then
//       place the actual order. Only ever marks an order "paid" once the
//       signature has been cryptographically verified with our key secret.
// @route POST /api/payments/verifyPayment
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed. Signature mismatch.' });
  }

  const cart = await Cart.findOne({ user_id: req.user._id }).populate('products.product_id');

  if (!cart || cart.products.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }

  try {
    await (cart);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const order = await createOrderFromCart({
    userId: req.user._id,
    cart,
    shippingAddress,
    paymentMethod: 'online',
    paymentStatus: 'paid',
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });

  await sendOrderConfirmationEmail(req.user, order);

  res.status(201).json({ success: true, message: 'Payment verified and order placed successfully', order });
});

module.exports = { createRazorpayOrder, verifyRazorpayPayment };

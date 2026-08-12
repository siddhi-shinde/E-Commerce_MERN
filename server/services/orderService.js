const { calculateDiscountAmount, calculateFinalPrice } = require('../utils/calculatePrice');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

const DELIVERY_CHARGE = Number(process.env.DELIVERY_CHARGE || 50);
const FREE_DELIVERY_THRESHOLD = Number(process.env.FREE_DELIVERY_THRESHOLD || 999);

// Builds the order "products" snapshot + totals from a populated cart
const buildOrderFromCart = (cart) => {
  let subtotal = 0;
  let discountAmount = 0;

  const products = cart.products.map((entry) => {
    const product = entry.product_id;
    const price = product.price;
    const discount = product.discount || 0;
    const quantity = entry.quantity;

    const lineDiscount = calculateDiscountAmount(price, discount) * quantity;
    const finalPrice = calculateFinalPrice(price, discount);

    subtotal += price * quantity;
    discountAmount += lineDiscount;

    return {
      product_id: product._id,
      vendor_id: product.createdBy,
      productName: product.name,
      productImage: product.mainImage,
      quantity,
      price,
      discount,
      finalPrice,
    };
  });

  subtotal = Number(subtotal.toFixed(2));
  discountAmount = Number(discountAmount.toFixed(2));

  const amountAfterDiscount = subtotal - discountAmount;
  const deliveryCharge = amountAfterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const totalAmount = Number((amountAfterDiscount + deliveryCharge).toFixed(2));

  return { products, subtotal, discountAmount, deliveryCharge, totalAmount };
};

// Throws if any item in a populated cart is out of stock / unavailable
const validateCartStock = async (cart) => {
  for (const item of cart.products) {
    const product = item.product_id;
    if (!product || !product.isAvailable) {
      throw new Error(`${product ? product.name : 'A product'} is no longer available`);
    }
    if (item.quantity > product.quantity) {
      throw new Error(`Only ${product.quantity} units of ${product.name} are in stock`);
    }
  }
};

// Creates the Order document, decrements stock, and clears the cart.
// Shared by the cash-on-delivery flow and the Razorpay-verified flow so the
// two payment paths can never diverge in how an order actually gets created.
const createOrderFromCart = async ({
  userId,
  cart,
  shippingAddress,
  paymentMethod,
  paymentStatus,
  razorpayOrderId,
  razorpayPaymentId,
}) => {
  const { products, subtotal, discountAmount, deliveryCharge, totalAmount } = buildOrderFromCart(cart);

  const order = await Order.create({
    user_id: userId,
    products,
    shippingAddress,
    subtotal,
    discountAmount,
    deliveryCharge,
    totalAmount,
    paymentMethod,
    paymentStatus,
    orderStatus: 'placed',
    razorpayOrderId,
    razorpayPaymentId,
  });

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

  cart.products = [];
  await cart.save();

  return order;
};

module.exports = { buildOrderFromCart, validateCartStock, createOrderFromCart };

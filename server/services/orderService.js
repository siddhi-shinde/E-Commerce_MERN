const { calculateDiscountAmount, calculateFinalPrice } = require('../utils/calculatePrice');

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

module.exports = { buildOrderFromCart };

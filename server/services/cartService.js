const { calculateDiscountAmount, calculateFinalPrice } = require('../utils/calculatePrice');

// Computes the full cart summary given a cart whose products.product_id is populated
const buildCartSummary = (cart) => {
  let itemTotal = 0;
  let itemDiscount = 0;
  let totalQuantity = 0;

  const items = cart.products.map((entry) => {
    const product = entry.product_id;
    const price = product.price;
    const discount = product.discount || 0;
    const quantity = entry.quantity;

    const discountAmount = calculateDiscountAmount(price, discount);
    const finalPrice = calculateFinalPrice(price, discount);

    itemTotal += price * quantity;
    itemDiscount += discountAmount * quantity;
    totalQuantity += quantity;

    return {
      product_id: product._id,
      name: product.name,
      mainImage: product.mainImage,
      price,
      discount,
      finalPrice,
      quantity,
      lineTotal: Number((finalPrice * quantity).toFixed(2)),
    };
  });

  const subtotal = Number(itemTotal.toFixed(2));
  const totalDiscount = Number(itemDiscount.toFixed(2));
  const finalCartAmount = Number((subtotal - totalDiscount).toFixed(2));

  return {
    items,
    itemTotal: subtotal,
    itemDiscount: totalDiscount,
    subtotal,
    totalDiscount,
    finalCartAmount,
    totalProducts: items.length,
    totalQuantity,
  };
};

module.exports = { buildCartSummary };

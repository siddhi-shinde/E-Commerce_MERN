// Discount Amount = Price x Discount / 100
const calculateDiscountAmount = (price, discount) => {
  return Number(((price * discount) / 100).toFixed(2));
};

// Final Price = Price - Discount Amount
const calculateFinalPrice = (price, discount) => {
  const discountAmount = calculateDiscountAmount(price, discount);
  return Number((price - discountAmount).toFixed(2));
};

// Average Rating = Total Rating / Total Number of Reviews
const calculateAverageRating = (reviews = []) => {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return Number((total / reviews.length).toFixed(1));
};

module.exports = {
  calculateDiscountAmount,
  calculateFinalPrice,
  calculateAverageRating,
};

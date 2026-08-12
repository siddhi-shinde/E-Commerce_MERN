const Razorpay = require('razorpay');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    'Warning: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Online payments will fail until these are configured in .env'
  );
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;

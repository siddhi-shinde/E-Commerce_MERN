const { body } = require('express-validator');

const verifyPaymentValidator = [
  body('razorpay_order_id').trim().notEmpty().withMessage('razorpay_order_id is required'),
  body('razorpay_payment_id').trim().notEmpty().withMessage('razorpay_payment_id is required'),
  body('razorpay_signature').trim().notEmpty().withMessage('razorpay_signature is required'),
  body('shippingAddress.name').trim().notEmpty().withMessage('Shipping name is required'),
  body('shippingAddress.contactNumber')
    .matches(/^[0-9]{10}$/)
    .withMessage('A valid 10 digit contact number is required'),
  body('shippingAddress.houseNumber').trim().notEmpty().withMessage('House number is required'),
  body('shippingAddress.area').trim().notEmpty().withMessage('Area is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
  body('shippingAddress.pincode').trim().notEmpty().withMessage('Pincode is required'),
];

module.exports = { verifyPaymentValidator };

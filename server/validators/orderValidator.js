const { body } = require('express-validator');

const placeOrderValidator = [
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
  body('paymentMethod')
    .isIn(['cash_on_delivery', 'online'])
    .withMessage('Payment method must be cash_on_delivery or online'),
];

module.exports = { placeOrderValidator };

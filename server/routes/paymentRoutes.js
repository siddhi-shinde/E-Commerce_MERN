const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { verifyPaymentValidator } = require('../validators/paymentValidator');

router.post('/createOrder', protect, authorizeRoles('customer'), createRazorpayOrder);
router.post('/verifyPayment', protect, authorizeRoles('customer'), verifyPaymentValidator, validate, verifyRazorpayPayment);

module.exports = router;

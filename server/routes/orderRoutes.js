const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getVendorOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { placeOrderValidator } = require('../validators/orderValidator');
const { validate } = require('../middleware/validationMiddleware');

router.post('/placeOrder', protect, authorizeRoles('customer'), placeOrderValidator, validate, placeOrder);
router.get('/getMyOrders', protect, authorizeRoles('customer'), getMyOrders);
router.get('/getAllOrders', protect, authorizeRoles('admin'), getAllOrders);
router.get('/getVendorOrders', protect, authorizeRoles('vendor'), getVendorOrders);
router.get('/getOrderById/:id', protect, getOrderById);
router.put('/cancelOrder/:id', protect, authorizeRoles('customer'), cancelOrder);
router.put('/updateOrderStatus/:id', protect, authorizeRoles('admin'), updateOrderStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  increaseQuantity,
  decreaseQuantity,
  updateQuantity,
  removeProduct,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Only logged-in customers should access cart APIs
router.use(protect, authorizeRoles('customer'));

router.post('/addToCart', addToCart);
router.get('/getCart', getCart);
router.put('/increaseQuantity/:id', increaseQuantity);
router.put('/decreaseQuantity/:id', decreaseQuantity);
router.put('/updateQuantity/:id', updateQuantity);
router.delete('/removeProduct/:id', removeProduct);
router.delete('/clearCart', clearCart);

module.exports = router;

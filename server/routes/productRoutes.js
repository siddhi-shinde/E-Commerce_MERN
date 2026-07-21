const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByBrand,
  getProductsByVendor,
  getMyProducts,
  getFeaturedProducts,
  getLatestProducts,
  getTopRatedProducts,
  searchProducts,
  filterProducts,
  sortProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { uploadProductImages } = require('../middleware/uploadMiddleware');
const { productValidator } = require('../validators/productValidator');
const { validate } = require('../middleware/validationMiddleware');

const productUpload = uploadProductImages.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'productImages', maxCount: 8 },
]);

router.post(
  '/createProduct',
  protect,
  authorizeRoles('admin', 'vendor'),
  productUpload,
  productValidator,
  validate,
  createProduct
);
router.get('/getAllProducts', getAllProducts);
router.get('/getFeaturedProducts', getFeaturedProducts);
router.get('/getLatestProducts', getLatestProducts);
router.get('/getTopRatedProducts', getTopRatedProducts);
router.get('/search', searchProducts);
router.get('/filter', filterProducts);
router.get('/sort', sortProducts);
router.get('/getMyProducts', protect, authorizeRoles('admin', 'vendor'), getMyProducts);
router.get('/getProductById/:id', getProductById);
router.get('/getProductsByCategory/:id', getProductsByCategory);
router.get('/getProductsByBrand/:id', getProductsByBrand);
router.get('/getProductsByVendor/:id', getProductsByVendor);
router.put('/updateProduct/:id', protect, authorizeRoles('admin', 'vendor'), productUpload, updateProduct);
router.delete('/deleteProduct/:id', protect, authorizeRoles('admin', 'vendor'), deleteProduct);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getActiveCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { uploadCategoryImage } = require('../middleware/uploadMiddleware');
const { categoryValidator } = require('../validators/categoryValidator');
const { validate } = require('../middleware/validationMiddleware');

router.post(
  '/createCategory',
  protect,
  authorizeRoles('admin'),
  uploadCategoryImage.single('categoryImage'),
  categoryValidator,
  validate,
  createCategory
);
router.get('/getAllCategories', getAllCategories);
router.get('/getActiveCategories', getActiveCategories);
router.get('/getCategoryById/:id', getCategoryById);
router.put('/updateCategory/:id', protect, authorizeRoles('admin'), uploadCategoryImage.single('categoryImage'), updateCategory);
router.delete('/deleteCategory/:id', protect, authorizeRoles('admin'), deleteCategory);
router.put('/updateCategoryStatus/:id', protect, authorizeRoles('admin'), updateCategoryStatus);

module.exports = router;

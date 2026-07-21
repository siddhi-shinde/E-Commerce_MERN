const express = require('express');
const router = express.Router();
const {
  createBrand,
  getAllBrands,
  getActiveBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  updateBrandStatus,
} = require('../controllers/brandController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { uploadBrandImage } = require('../middleware/uploadMiddleware');
const { brandValidator } = require('../validators/brandValidator');
const { validate } = require('../middleware/validationMiddleware');

router.post(
  '/createBrand',
  protect,
  authorizeRoles('admin'),
  uploadBrandImage.single('brandImage'),
  brandValidator,
  validate,
  createBrand
);
router.get('/getAllBrands', getAllBrands);
router.get('/getActiveBrands', getActiveBrands);
router.get('/getBrandById/:id', getBrandById);
router.put('/updateBrand/:id', protect, authorizeRoles('admin'), uploadBrandImage.single('brandImage'), updateBrand);
router.delete('/deleteBrand/:id', protect, authorizeRoles('admin'), deleteBrand);
router.put('/updateBrandStatus/:id', protect, authorizeRoles('admin'), updateBrandStatus);

module.exports = router;

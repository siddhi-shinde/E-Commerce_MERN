const asyncHandler = require('../utils/asyncHandler');
const Brand = require('../models/brandModel');

const createBrand = asyncHandler(async (req, res) => {
  const { brandName } = req.body;

  const existing = await Brand.findOne({ brandName });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Brand already exists' });
  }

  const brand = await Brand.create({
    brandName,
    brandImage: req.file ? `/uploads/brands/${req.file.filename}` : '',
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Brand created successfully', brand });
});

const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: brands.length, brands });
});

const getActiveBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ brandName: 1 });
  res.status(200).json({ success: true, count: brands.length, brands });
});

const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }
  res.status(200).json({ success: true, brand });
});

const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }

  if (req.body.brandName) brand.brandName = req.body.brandName;
  if (req.file) brand.brandImage = `/uploads/brands/${req.file.filename}`;
  brand.updatedBy = req.user._id;

  await brand.save();

  res.status(200).json({ success: true, message: 'Brand updated successfully', brand });
});

const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) {
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }
  res.status(200).json({ success: true, message: 'Brand deleted successfully' });
});

const updateBrandStatus = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }

  brand.isActive = req.body.isActive !== undefined ? req.body.isActive : !brand.isActive;
  brand.updatedBy = req.user._id;
  await brand.save();

  res.status(200).json({
    success: true,
    message: `Brand has been ${brand.isActive ? 'activated' : 'deactivated'}`,
    brand,
  });
});

module.exports = {
  createBrand,
  getAllBrands,
  getActiveBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  updateBrandStatus,
};

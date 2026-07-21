const asyncHandler = require('../utils/asyncHandler');
const Category = require('../models/categoryModel');

const createCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;

  const existing = await Category.findOne({ categoryName });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Category already exists' });
  }

  const category = await Category.create({
    categoryName,
    categoryImage: req.file ? `/uploads/categories/${req.file.filename}` : '',
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Category created successfully', category });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: categories.length, categories });
});

const getActiveCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ categoryName: 1 });
  res.status(200).json({ success: true, count: categories.length, categories });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  res.status(200).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  if (req.body.categoryName) category.categoryName = req.body.categoryName;
  if (req.file) category.categoryImage = `/uploads/categories/${req.file.filename}`;
  category.updatedBy = req.user._id;

  await category.save();

  res.status(200).json({ success: true, message: 'Category updated successfully', category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  res.status(200).json({ success: true, message: 'Category deleted successfully' });
});

const updateCategoryStatus = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  category.isActive = req.body.isActive !== undefined ? req.body.isActive : !category.isActive;
  category.updatedBy = req.user._id;
  await category.save();

  res.status(200).json({
    success: true,
    message: `Category has been ${category.isActive ? 'activated' : 'deactivated'}`,
    category,
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  getActiveCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
};

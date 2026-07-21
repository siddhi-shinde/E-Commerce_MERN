const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/userModel');

// @desc Get all users
// @route GET /api/users/getAllUsers
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, users });
});

// @desc Get user by ID
// @route GET /api/users/getUserById/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, user });
});

// @desc Update own profile
// @route PUT /api/users/updateProfile
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'contactNumber',
    'houseNumber',
    'area',
    'city',
    'state',
    'country',
    'pincode',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Profile updated successfully', user });
});

// @desc Upload profile image
// @route PUT /api/users/uploadProfileImage
const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image' });
  }

  const imagePath = `/uploads/profiles/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(req.user._id, { profileImage: imagePath }, { new: true });

  res.status(200).json({ success: true, message: 'Profile image uploaded', user });
});

// @desc Update user role (admin only)
// @route PUT /api/users/updateRole/:id
const updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'vendor', 'customer'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role provided' });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, message: 'User role updated', user });
});

// @desc Activate or deactivate a user (admin only)
// @route PUT /api/users/updateStatus/:id
const updateStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User has been ${user.isActive ? 'activated' : 'deactivated'}`,
    user,
  });
});

// @desc Delete user (admin only)
// @route DELETE /api/users/deleteUser/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  uploadProfileImage,
  updateRole,
  updateStatus,
  deleteUser,
};

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  uploadProfileImage,
  updateRole,
  updateStatus,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { uploadProfileImage: uploadProfileImageMiddleware } = require('../middleware/uploadMiddleware');

router.get('/getAllUsers', protect, authorizeRoles('admin'), getAllUsers);
router.get('/getUserById/:id', protect, authorizeRoles('admin'), getUserById);
router.put('/updateProfile', protect, updateProfile);
router.put('/uploadProfileImage', protect, uploadProfileImageMiddleware.single('profileImage'), uploadProfileImage);
router.put('/updateRole/:id', protect, authorizeRoles('admin'), updateRole);
router.put('/updateStatus/:id', protect, authorizeRoles('admin'), updateStatus);
router.delete('/deleteUser/:id', protect, authorizeRoles('admin'), deleteUser);

module.exports = router;

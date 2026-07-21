const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserInfo,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidator');

router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);
router.get('/getUserInfo', protect, getUserInfo);
router.put('/changePassword', protect, changePasswordValidator, validate, changePassword);
router.post('/forgotPassword', forgotPasswordValidator, validate, forgotPassword);
router.post('/resetPassword', resetPasswordValidator, validate, resetPassword);

module.exports = router;

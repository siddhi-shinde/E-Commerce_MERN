const express = require("express");

const router = express.Router();

// Controllers
const {
    register,
    login,
    getUserInfo,
    updateProfile,
    changePassword,
    forgotPassword
} = require("../controllers/authController");

// Middleware
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

// Validators
const {
    registerValidator,
    loginValidator,
    changePasswordValidator,
    forgotPasswordValidator
} = require("../validators/authValidator");


// ================= REGISTER =================

router.post(
    "/register",
    registerValidator,
    validate,
    register
);


// ================= LOGIN =================

router.post(
    "/login",
    loginValidator,
    validate,
    login
);


// ================= GET USER INFO =================

router.get(
    "/getUserInfo",
    protect,
    getUserInfo
);


// ================= UPDATE PROFILE =================

router.put(
    "/updateProfile",
    protect,
    updateProfile
);


// ================= CHANGE PASSWORD =================

router.put(
    "/changePassword",
    protect,
    changePasswordValidator,
    validate,
    changePassword
);

router.post(
    "/forgotPassword",
    forgotPasswordValidator,
    validate,
    forgotPassword
);


module.exports = router;
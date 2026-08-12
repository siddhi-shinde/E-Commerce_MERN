const { body } = require("express-validator");


// ======================================================
// REGISTER VALIDATOR
// ======================================================

const registerValidator = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),


    body("email")
        .trim()
        .isEmail()
        .withMessage("A valid email is required")
        .normalizeEmail(),


    body("password")
        .isLength({
            min: 6
        })
        .withMessage(
            "Password must be at least 6 characters long"
        ),


    body("contactNumber")
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage(
            "Contact number must be a valid 10 digit number"
        )

];



// ======================================================
// LOGIN VALIDATOR
// ======================================================

const loginValidator = [

    body("email")
        .trim()
        .isEmail()
        .withMessage("A valid email is required")
        .normalizeEmail(),


    body("password")
        .notEmpty()
        .withMessage("Password is required")

];



// ======================================================
// CHANGE PASSWORD VALIDATOR
// ======================================================

const changePasswordValidator = [

    body("oldPassword")
        .notEmpty()
        .withMessage(
            "Old password is required"
        ),


    body("newPassword")
        .isLength({
            min: 6
        })
        .withMessage(
            "New password must be at least 6 characters long"
        )

];



// ======================================================
// FORGOT PASSWORD VALIDATOR
// ======================================================

const forgotPasswordValidator = [

    body("email")
        .trim()
        .isEmail()
        .withMessage(
            "A valid email is required"
        )
        .normalizeEmail()

];



// ======================================================
// RESET PASSWORD VALIDATOR
// ======================================================

const resetPasswordValidator = [

    body("token")
        .notEmpty()
        .withMessage(
            "Reset token is required"
        ),


    body("newPassword")
        .isLength({
            min: 6
        })
        .withMessage(
            "New password must be at least 6 characters long"
        )

];



// ======================================================
// EXPORT
// ======================================================

module.exports = {
    registerValidator,
    loginValidator,
    changePasswordValidator,
    forgotPasswordValidator,
    resetPasswordValidator
};
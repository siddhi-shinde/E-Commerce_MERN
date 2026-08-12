const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ======================================================
// REGISTER
// ======================================================

const register = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            contactNumber
        } = req.body;


        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                msg: "Email already exists."
            });
        }


        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);


        // Create user
        const user = await User.create({
            name,
            email,
            password: hashPassword,
            contactNumber
        });


        return res.status(201).json({
            success: true,
            msg: "Registration Successful",
            user
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};



// ======================================================
// LOGIN
// ======================================================

const login = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;


        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }


        // Compare password
        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.status(400).json({
                success: false,
                msg: "Incorrect Password"
            });
        }


        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );


        return res.status(200).json({
            success: true,
            msg: "Login Successful",
            token,
            user
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};



// ======================================================
// GET USER INFO
// ======================================================

const getUserInfo = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
            .select("-password");


        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }


        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};



// ======================================================
// UPDATE PROFILE
// ======================================================

const updateProfile = async (req, res) => {
    try {

        const {
            name,
            contactNumber
        } = req.body;


        const updateData = {
            name,
            contactNumber
        };


        // If profile image uploaded
        if (req.file) {
            updateData.imgPath = req.file.filename;
        }


        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            {
                new: true
            }
        ).select("-password");


        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }


        return res.status(200).json({
            success: true,
            msg: "Profile Updated",
            user
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};



// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePassword = async (req, res) => {
    try {

        const {
            oldPassword,
            newPassword
        } = req.body;


        // Find logged-in user
        const user = await User.findById(req.user.id);


        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }


        // Compare old password
        const match = await bcrypt.compare(
            oldPassword,
            user.password
        );


        if (!match) {
            return res.status(400).json({
                success: false,
                msg: "Old Password Incorrect"
            });
        }


        // Hash new password
        user.password = await bcrypt.hash(
            newPassword,
            10
        );


        await user.save();


        return res.status(200).json({
            success: true,
            msg: "Password Changed Successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token before saving to database
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Token expires after 15 minutes
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save();

        // Reset password URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const message = `
            <h2>Password Reset Request</h2>

            <p>Hello ${user.name},</p>

            <p>
                You requested to reset your password.
            </p>

            <p>
                Click the button below to reset your password.
            </p>

            <a
                href="${resetUrl}"
                style="
                    display:inline-block;
                    padding:10px 20px;
                    background:#007bff;
                    color:white;
                    text-decoration:none;
                    border-radius:5px;
                "
            >
                Reset Password
            </a>

            <p>
                This link will expire in 15 minutes.
            </p>

            <p>
                If you did not request this, please ignore this email.
            </p>
        `;

        // Send email
        await sendEmail(
            user.email,
            "Password Reset Request",
            message
        );

        return res.status(200).json({
            success: true,
            msg: "Password reset link sent to your email"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    register,
    login,
    getUserInfo,
    updateProfile,
    changePassword,
    forgotPassword
};
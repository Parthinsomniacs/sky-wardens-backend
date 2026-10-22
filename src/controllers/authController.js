const User = require("../models/User");
const Role = require("../models/Role");

// @desc    Authenticate admin user & get JWT token
// @route   POST /api/auth/login
// @access  Public (Rate-limited, Strict Validation)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Fetch user by email with password and populated role
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select("+password")
      .populate("role");

    // Generic response to prevent user enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // 2. Verify password hash using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // 4. Verify Account & Role Status (ONLY checked AFTER password passes!)
    if (user.status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact the administrator.",
      });
    }

    if (!user.role || !user.role.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your assigned role is inactive or invalid. Access denied.",
      });
    }

    // 5. Reset failed login attempts & update last login on success
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    await user.save({ validateBeforeSave: false });

    // 6. Generate Signed JWT with verified Role name
    const roleName = user.role.name || "Super Admin";
    const token = user.getSignedJwtToken(roleName);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: roleName,
        avatar: user.avatar || "SA",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated admin user profile
// @route   GET /api/auth/me
// @access  Private (JWT Protected)
const getMe = async (req, res, next) => {
  try {
    const roleName = req.user.role?.name || req.user.role || "Super Admin";

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id || req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || "",
        role: roleName,
        avatar: req.user.avatar || "SA",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin user profile (Name, Email, Mobile Number, Avatar)
// @route   PUT /api/auth/profile
// @access  Private (JWT Protected)
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // If email is changed, verify uniqueness
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: `Email '${email}' is already registered with another account.`,
        });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    const roleName = user.role?.name || req.user.role?.name || req.user.role || "Super Admin";

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: roleName,
        avatar: user.avatar || "SA",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change admin user password
// @route   PUT /api/auth/change-password
// @access  Private (JWT Protected)
const changePassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Confirm password does not match.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Store previous encrypted password hash in oldPassword
    user.oldPassword = user.password;
    // Set new password (pre-save hook will hash it with bcrypt salt 12)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
      oldPassword: user.oldPassword,
      newPassword: user.password,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  updateProfile,
  changePassword,
};


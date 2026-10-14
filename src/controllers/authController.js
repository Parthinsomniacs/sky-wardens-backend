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

    // 2. Check if account is temporarily locked due to repeated brute-force attempts
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      });
    }

    // 3. Verify password hash using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment failed attempts and trigger lockout if >= 5
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
      }
      await user.save({ validateBeforeSave: false });

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
        role: roleName,
        avatar: req.user.avatar || "SA",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};

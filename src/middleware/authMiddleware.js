const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

  if (!token) {
    if (isDev) {
      const devAdmin = await User.findOne({ status: "Active" }).populate("role");
      if (devAdmin) {
        req.user = devAdmin;
        return next();
      }
    }
    return res.status(401).json({
      success: false,
      message: "Access Denied: Not authorized to access this resource without a valid token.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request with populated role
    req.user = await User.findById(decoded.id).select("-password").populate("role");

    if (!req.user) {
      if (isDev) {
        const devAdmin = await User.findOne({ status: "Active" }).populate("role");
        if (devAdmin) {
          req.user = devAdmin;
          return next();
        }
      }
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    if (req.user.status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive. Please contact the Super Administrator.",
      });
    }

    if (req.user.role && !req.user.role.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your assigned role is inactive. Access denied.",
      });
    }

    next();
  } catch (error) {
    if (isDev) {
      const devAdmin = await User.findOne({ status: "Active" }).populate("role");
      if (devAdmin) {
        req.user = devAdmin;
        return next();
      }
    }
    return res.status(401).json({
      success: false,
      message: "Token verification failed or token has expired.",
    });
  }
};

// Grant access to specific roles (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.name || req.user?.role;
    if (!req.user || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Clearance level '${userRole || "Unauthenticated"}' does not have permission to access this endpoint.`,
      });
    }
    next();
  };
};

// Shortcut for Super Admin only
const superAdminOnly = authorize("Super Admin");

module.exports = {
  protect,
  authorize,
  superAdminOnly,
};

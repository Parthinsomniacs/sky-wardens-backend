const User = require("../models/User");
const Role = require("../models/Role");

// @desc    Get all admin users
// @route   GET /api/users
// @access  Private (Super Admin Only)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("role")
      .sort({ createdAt: -1 });

    const formattedUsers = users.map((u) => ({
      _id: u._id,
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role?.name || "Super Admin",
      avatar: u.avatar,
      status: u.status,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new admin user
// @route   POST /api/users
// @access  Private (Super Admin Only)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide both name and email.",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An account with email '${email}' already exists.`,
      });
    }

    // Currently only Super Admin role is active
    let superAdminRole = await Role.findOne({ name: "Super Admin" });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: "Super Admin",
        slug: "super-admin",
        description: "Full System Operational & Defense Clearance Access",
        permissions: ["*"],
        isActive: true,
      });
    }

    const tempPassword = password || "SuperAdmin@Sky2026#";

    const count = await User.countDocuments();
    const id = `USR-${String(count + 1).padStart(3, "0")}`;

    const initials =
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "SA";

    const user = await User.create({
      id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: tempPassword,
      role: superAdminRole._id,
      avatar: initials,
      status: "Active",
    });

    res.status(201).json({
      success: true,
      message: `User '${user.name}' provisioned as Super Admin.`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "Super Admin",
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin user
// @route   PUT /api/users/:id
// @access  Private (Super Admin Only)
const updateUser = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let user = await User.findOne({ id: identifier });
    if (!user && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Whitelist only safe update fields (Prevent Mass Assignment)
    const allowedFields = ["name", "department", "status"];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("role");

    res.status(200).json({
      success: true,
      message: `User '${updated.name}' updated successfully.`,
      user: {
        _id: updated._id,
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role?.name || "Super Admin",
        department: updated.department,
        clearance: updated.clearance,
        avatar: updated.avatar,
        status: updated.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete admin user
// @route   DELETE /api/users/:id
// @access  Private (Super Admin Only)
const deleteUser = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let user = await User.findOne({ id: identifier });
    if (!user && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent deleting root super admin
    if (user.id === "USR-001" || user.email === "admin@skywardens.com") {
      return res.status(400).json({
        success: false,
        message: "Root Super Administrator account cannot be deleted.",
      });
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: `User '${user.name}' removed from system.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};

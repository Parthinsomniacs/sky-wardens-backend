const Division = require("../models/Division");

// @desc    Get all divisions
// @route   GET /api/divisions
// @access  Public
const getDivisions = async (req, res, next) => {
  try {
    const divisions = await Division.find().sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      count: divisions.length,
      divisions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new division
// @route   POST /api/divisions
// @access  Private (Admin)
const createDivision = async (req, res, next) => {
  try {
    const { name, description, status, badgeColor } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Division name is required.",
      });
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const existing = await Division.findOne({
      $or: [{ name: name.trim() }, { slug }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Division with name '${name}' or slug '${slug}' already exists.`,
      });
    }

    const division = await Division.create({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
      status: status || "Active",
      badgeColor: badgeColor || "bg-indigo-600",
    });

    res.status(201).json({
      success: true,
      message: `Division '${division.name}' created successfully.`,
      division,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update division
// @route   PUT /api/divisions/:id
// @access  Private (Admin)
const updateDivision = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let division = await Division.findOne({
      $or: [{ id: identifier }, { slug: identifier }],
    });

    if (!division && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      division = await Division.findById(identifier);
    }

    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found.",
      });
    }

    const updated = await Division.findByIdAndUpdate(division._id, req.body, {
      new: true,
      runValidators: true,
    });

    // Cascade status to all products belonging to this division
    if (req.body.status) {
      const Product = require("../models/Product");
      await Product.updateMany(
        { division: new RegExp(`^${division.name}$`, "i") },
        { status: req.body.status }
      );
    }

    // Cascade division name update if changed
    if (req.body.name && req.body.name.trim() !== division.name) {
      const Product = require("../models/Product");
      await Product.updateMany(
        { division: new RegExp(`^${division.name}$`, "i") },
        { division: req.body.name.trim() }
      );
    }

    res.status(200).json({
      success: true,
      message: `Division '${updated.name}' updated successfully.`,
      division: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete division
// @route   DELETE /api/divisions/:id
// @access  Private (Admin)
const deleteDivision = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let division = await Division.findOne({
      $or: [{ id: identifier }, { slug: identifier }],
    });

    if (!division && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      division = await Division.findById(identifier);
    }

    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found.",
      });
    }

    // Protect core Aerospace and Defence divisions
    if (
      division.name.toLowerCase() === "aerospace" ||
      division.name.toLowerCase() === "defence"
    ) {
      return res.status(400).json({
        success: false,
        message: "Core divisions (Aerospace & Defence) cannot be deleted.",
      });
    }

    await Division.findByIdAndDelete(division._id);

    res.status(200).json({
      success: true,
      message: `Division '${division.name}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
};

const Lead = require("../models/Lead");

// @desc    Submit inquiry/lead from public website
// @route   POST /api/leads
// @access  Public (Rate-limited)
const submitLead = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      designation,
      country,
      state,
      city,
      productInquired,
      category,
      type,
      message,
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide your full name, email address, and inquiry message.",
      });
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || "",
      company: company?.trim() || "",
      designation: designation?.trim() || "",
      country: country?.trim() || "India",
      state: state?.trim() || "",
      city: city?.trim() || "",
      productInquired: productInquired?.trim() || "General Aerospace/Defence Inquiry",
      category: category?.trim() || "Aerospace",
      type: type?.trim() || "Product(s) Inquiry",
      message: message.trim(),
      status: "New",
      priority: "Standard",
    });

    res.status(201).json({
      success: true,
      message: "Thank you for reaching out. Your inquiry has been transmitted securely to our defense procurement team.",
      leadId: lead.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leads & inquiries
// @route   GET /api/leads
// @access  Private (SUPER ADMIN ONLY - Strictly restricted!)
const getLeads = async (req, res, next) => {
  try {
    const { status, priority, category, search } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (priority && priority !== "all") {
      query.priority = priority;
    }

    if (category && category !== "all") {
      query.category = new RegExp(category, "i");
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { company: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { productInquired: new RegExp(search, "i") },
        { id: new RegExp(search, "i") },
      ];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead details
// @route   GET /api/leads/:id
// @access  Private (SUPER ADMIN ONLY)
const getLeadById = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let lead = await Lead.findOne({ id: identifier });
    if (!lead && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      lead = await Lead.findById(identifier);
    }

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead inquiry not found.",
      });
    }

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status / priority / notes
// @route   PUT /api/leads/:id
// @access  Private (SUPER ADMIN ONLY)
const updateLead = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let lead = await Lead.findOne({ id: identifier });
    if (!lead && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      lead = await Lead.findById(identifier);
    }

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead inquiry not found.",
      });
    }

    const updated = await Lead.findByIdAndUpdate(lead._id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Lead updated successfully.",
      lead: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lead inquiry
// @route   DELETE /api/leads/:id
// @access  Private (SUPER ADMIN ONLY)
const deleteLead = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let lead = await Lead.findOne({ id: identifier });
    if (!lead && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      lead = await Lead.findById(identifier);
    }

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    await Lead.findByIdAndDelete(lead._id);

    res.status(200).json({
      success: true,
      message: "Lead removed from system.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
};

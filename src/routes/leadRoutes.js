const express = require("express");
const router = express.Router();
const {
  submitLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");
const { leadSubmissionLimiter } = require("../middleware/rateLimiter");

// Public inquiry submission (Anti-spam rate limited)
router.post("/", leadSubmissionLimiter, submitLead);

// SUPER ADMIN ONLY ENDPOINTS (Strictly protected from Normal Admin)
router.get("/", protect, superAdminOnly, getLeads);
router.get("/:id", protect, superAdminOnly, getLeadById);
router.put("/:id", protect, superAdminOnly, updateLead);
router.delete("/:id", protect, superAdminOnly, deleteLead);

module.exports = router;

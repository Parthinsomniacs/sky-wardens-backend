const express = require("express");
const router = express.Router();
const {
  getDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
} = require("../controllers/divisionController");
const { protect } = require("../middleware/authMiddleware");

// Public (to populate tabs on both frontend & admin)
router.get("/", getDivisions);

// Protected (Admin operations)
router.post("/", protect, createDivision);
router.put("/:id", protect, updateDivision);
router.delete("/:id", protect, deleteDivision);

module.exports = router;

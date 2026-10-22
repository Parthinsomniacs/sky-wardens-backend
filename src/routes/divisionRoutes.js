const express = require("express");
const router = express.Router();
const {
  getDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
} = require("../controllers/divisionController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  createDivisionSchema,
  updateDivisionSchema,
} = require("../validators/divisionValidator");

// Public (to populate tabs on both frontend & admin)
router.get("/", getDivisions);

// Protected (Admin operations with validation and RBAC authorization)
router.post(
  "/",
  protect,
  validate(createDivisionSchema),
  createDivision
);

router.put(
  "/:id",
  protect,
  validate(updateDivisionSchema),
  updateDivision
);

router.delete("/:id", protect, deleteDivision);

module.exports = router;

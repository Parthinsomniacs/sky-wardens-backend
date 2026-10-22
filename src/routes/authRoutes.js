const express = require("express");
const router = express.Router();
const {
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validateMiddleware");
const {
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require("../validators/authValidator");

router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", protect, getMe);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);
router.put("/change-password", protect, validate(changePasswordSchema), changePassword);

module.exports = router;


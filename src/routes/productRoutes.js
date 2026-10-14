const express = require("express");
const router = express.Router();
const {
  getPublicProducts,
  getAllAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");

// Public routes (Website visitors)
router.get("/", getPublicProducts);
router.get("/:id", getProductById);

// Protected routes (Admin Portal)
router.get("/admin/all", protect, getAllAdminProducts);
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.patch("/:id/status", protect, toggleProductStatus);
router.delete("/:id", protect, deleteProduct);

module.exports = router;

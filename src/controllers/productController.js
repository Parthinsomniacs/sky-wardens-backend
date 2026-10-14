const Product = require("../models/Product");

// @desc    Get active products for public client website
// @route   GET /api/products
// @access  Public
const getPublicProducts = async (req, res, next) => {
  try {
    const { division, category, search } = req.query;

    // Public only gets Active products!
    const query = { status: "Active" };

    if (division) {
      query.division = new RegExp(`^${division}$`, "i");
    }

    if (category && category !== "all") {
      query.$or = [
        { categoryId: category },
        { categoryTitle: new RegExp(category, "i") },
        { categoryName: new RegExp(category, "i") },
      ];
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { id: new RegExp(search, "i") },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (Active & Inactive) for Admin Portal
// @route   GET /api/products/admin/all
// @access  Private (Super Admin & Normal Admin)
const getAllAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let product = await Product.findOne({ id: identifier });
    if (!product && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with identifier '${identifier}' not found.`,
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Super Admin & Normal Admin)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      id,
      description,
      imageSrc,
      imageAlt,
      division,
      categoryId,
      categoryTitle,
      categoryName,
      status,
      details,
    } = req.body;

    if (!name || !imageSrc || !division) {
      return res.status(400).json({
        success: false,
        message: "Please provide product name, division, and an image.",
      });
    }

    const generatedId =
      id?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check if ID already exists
    const existing = await Product.findOne({ id: generatedId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Product ID '${generatedId}' already exists. Please choose a unique name/ID.`,
      });
    }

    const product = await Product.create({
      id: generatedId,
      name: name.trim(),
      description: description?.trim() || `${name} tactical specification profile.`,
      imageSrc: imageSrc.trim(),
      imageAlt: imageAlt?.trim() || name.trim(),
      division: division.trim(),
      categoryId: categoryId?.trim() || "general",
      categoryTitle: categoryTitle?.trim() || categoryName?.trim() || "General Equipment",
      categoryName: categoryName?.trim() || categoryTitle?.trim() || "General Equipment",
      status: status || "Active",
      details: Array.isArray(details) ? details : [],
    });

    res.status(201).json({
      success: true,
      message: `Product '${product.name}' created successfully.`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let product = await Product.findOne({ id: identifier });
    if (!product && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with identifier '${identifier}' not found.`,
      });
    }

    const updated = await Product.findByIdAndUpdate(product._id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: `Product '${updated.name}' updated successfully.`,
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product status (Active <-> Inactive)
// @route   PATCH /api/products/:id/status
// @access  Private
const toggleProductStatus = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let product = await Product.findOne({ id: identifier });
    if (!product && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    product.status = product.status === "Active" ? "Inactive" : "Active";
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' status changed to '${product.status}'.`,
      status: product.status,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let product = await Product.findOne({ id: identifier });
    if (!product && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await Product.findByIdAndDelete(product._id);

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' was successfully deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicProducts,
  getAllAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
};

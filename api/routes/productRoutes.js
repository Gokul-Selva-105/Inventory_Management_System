import express from "express";
import { productController } from "../controllers/index.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", productController.getProducts);

// @route   GET /api/products/movements
// @desc    Get recent product movements
// @access  Public
router.get("/movements", productController.getRecentProductMovements);

// @route   GET /api/products/number/:productNumber
// @desc    Get product by product number
// @access  Public
router.get("/number/:productNumber", productController.getProductByNumber);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get("/:id", productController.getProductById);

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post("/", protect, admin, productController.createProduct);

// @route   POST /api/products/quick-add
// @desc    Quick add product (create if not found by name) for seamless QR workflow
// @access  Private (protected by 'protect' middleware)
router.post("/quick-add", protect, productController.quickAddProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put("/:id", protect, admin, productController.updateProduct);

// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, productController.deleteProduct);

// Update product status
router.put("/:productId/status", productController.updateProductStatus);

// Get product status history
router.get(
  "/:productId/status-history",
  productController.getProductStatusHistory
);

// @route   GET /api/products/check-name
// @desc    Check if product name is unique
// @access  Public
router.get("/check-name", productController.checkProductName);

// Record product movement
router.post("/movement", productController.recordProductMovement);

// Delete product movement
// @route   DELETE /api/products/movements/:id
// @desc    Delete a product movement record
// @access  Private (admin only)
router.delete(
  "/movements/:id",
  protect,
  admin,
  productController.deleteProductMovement
);

export default router;

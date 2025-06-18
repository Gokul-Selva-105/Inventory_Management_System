import express from "express";
import { categoryController } from "../controllers/index.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get("/", categoryController.getCategories);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get("/:id", categoryController.getCategoryById);

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private/Admin
router.post("/", protect, admin, categoryController.createCategory);

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put("/:id", protect, admin, categoryController.updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete("/:id", protect, admin, categoryController.deleteCategory);

export default router;

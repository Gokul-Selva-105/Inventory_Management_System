import express from "express";
import { userController } from "../controllers/index.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post("/register", userController.registerUser);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post("/login", userController.loginUser);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", protect, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, userController.updateUserProfile);

// @route   POST /api/users/admin-register
// @desc    Register a new admin user with secret key
// @access  Public
router.post("/admin-register", userController.registerAdminUser);

export default router;

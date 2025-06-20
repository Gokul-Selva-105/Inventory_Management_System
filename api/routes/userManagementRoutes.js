import express from "express";
import {
  getAllUsers,
  updateUserAdminStatus,
  deleteUser,
} from "../controllers/userManagementController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get("/", protect, admin, getAllUsers);

// @desc    Update user admin status
// @route   PUT /api/users/:id/admin-status
// @access  Private/Admin
router.put("/:id/admin-status", protect, admin, updateUserAdminStatus);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, deleteUser);

export default router;
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// @desc    Update user admin status
// @route   PUT /api/users/:id/admin-status
// @access  Private/Admin
const updateUserAdminStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    // Prevent admin from changing their own status
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own admin status" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isAdmin = isAdmin;
    await user.save();

    res.json({
      message: `User ${isAdmin ? 'promoted to admin' : 'removed from admin'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error updating admin status:", error);
    res.status(500).json({ message: "Failed to update admin status" });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting their own account
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export { getAllUsers, updateUserAdminStatus, deleteUser };
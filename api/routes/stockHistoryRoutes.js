import express from "express";
import { stockHistoryController } from "../controllers/index.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET /api/stock-history
// @desc    Get all stock history entries
// @access  Private
router.get("/", protect, stockHistoryController.getStockHistory);

// @route   GET /api/stock-history/:productId
// @desc    Get stock history for a specific product
// @access  Private
router.get(
  "/:productId",
  protect,
  stockHistoryController.getProductStockHistory
);

// @route   POST /api/stock-history
// @desc    Create a new stock history entry
// @access  Private
router.post("/", protect, stockHistoryController.createStockHistory);

export default router;

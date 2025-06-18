import mongoose from "mongoose";

const stockHistorySchema = mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    changeAmount: {
      type: Number,
      required: [true, "Change amount is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason for stock change is required"],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const StockHistory = mongoose.model("StockHistory", stockHistorySchema);

export default StockHistory;

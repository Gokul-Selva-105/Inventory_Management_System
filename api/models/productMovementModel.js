import mongoose from "mongoose";

const productMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productNumber: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ["send", "receive"],
    required: true,
  },
  notes: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ProductMovement = mongoose.model(
  "ProductMovement",
  productMovementSchema,
  "productmovements"
);

export default ProductMovement;

import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      trim: true,
    },
    productNumber: {
      type: String,
      required: [true, "Product number is required"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      default: "garage",
      trim: true,
    },
    previousLocation: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "/images/default-product.jpg",
    },
    status: {
      type: String,
      enum: ["Available", "Sent", "In Use", "Received", "Damaged"],
      default: "Available",
    },
    currentEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QrEvent",
      default: null,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["Available", "Sent", "In Use", "Received", "Damaged"],
          required: true,
        },
        event: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "QrEvent",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create a text index for search functionality
productSchema.index({
  name: "text",
  description: "text",
  productNumber: "text",
});

const Product = mongoose.model("Product", productSchema);

export default Product;

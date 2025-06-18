import mongoose from "mongoose";

const qrEventSchema = new mongoose.Schema(
  {
    product: { type: String, required: true },
    location: { type: String, required: true },
    eventType: { type: String, required: true },
    notes: { type: String },
    time: { type: Date, required: true },
    scheduledDate: { type: Date },
    status: {
      type: String,
      enum: ["completed", "scheduled", "cancelled"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("QrEvent", qrEventSchema);

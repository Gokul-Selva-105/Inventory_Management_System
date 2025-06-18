import express from "express";
import QrEvent from "../models/qrEventModel.js";

const router = express.Router();

// POST /api/qr-events - create a new QR event
router.post("/", async (req, res) => {
  try {
    const { product, location, eventType, notes, time } = req.body;
    const event = await QrEvent.create({
      product,
      location,
      eventType,
      notes,
      time: new Date(time),
      status: "completed",
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/qr-events/scheduled - create a scheduled event
router.post("/scheduled", async (req, res) => {
  try {
    const { product, location, eventType, notes, time, scheduledDate } =
      req.body;
    const event = await QrEvent.create({
      product,
      location,
      eventType,
      notes,
      time: new Date(time),
      scheduledDate: new Date(scheduledDate),
      status: "scheduled",
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/qr-events - get all QR events
router.get("/", async (req, res) => {
  try {
    const events = await QrEvent.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/qr-events/scheduled - get scheduled events
router.get("/scheduled", async (req, res) => {
  try {
    const events = await QrEvent.find({
      status: "scheduled",
      scheduledDate: { $gte: new Date() },
    }).sort({ scheduledDate: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/qr-events/upcoming - get upcoming events (next 7 days)
router.get("/upcoming", async (req, res) => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const events = await QrEvent.find({
      scheduledDate: { $gte: new Date(), $lte: nextWeek },
      status: "scheduled",
    }).sort({ scheduledDate: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/qr-events/:id/status - update event status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const event = await QrEvent.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

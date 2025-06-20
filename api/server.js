import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import stockHistoryRoutes from "./routes/stockHistoryRoutes.js";
import qrEventRoutes from "./routes/qrEventRoutes.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
// Update CORS configuration
app.use(cors({
  // Allow access from any IP address on the local network with the specified ports
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    // Check if origin matches localhost or any IP with our ports
    const allowedOrigins = ['5173', '5174', '5175', '5001'];
    const isAllowed = allowedOrigins.some(port => {
      return origin.match(`http://localhost:${port}`) || 
             origin.match(`http://127\.0\.0\.1:${port}`) || 
             origin.match(new RegExp(`http://192\.168\.[0-9]{1,3}\.[0-9]{1,3}:${port}`));
    });
    
    if(isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stock-history", stockHistoryRoutes);
app.use("/api/qr-events", qrEventRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Inventory Management System API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/inventory-management"
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Start server
const PORT = process.env.PORT || 5000; // Changed from 5000 to 5001 to avoid conflicts
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

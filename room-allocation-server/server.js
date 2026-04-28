import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import roomRoutes from "./api/routes/roomRoutes.js";
import allocationRoutes from "./api/routes/allocationRoutes.js";
import cancellationRoutes from './api/routes/cancellationRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());

// ניתובים
app.use("/api/rooms", roomRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/cancellations", cancellationRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!"); // הלוג שחיפשת
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // עצירת התהליך אם אין חיבור למסד
  });
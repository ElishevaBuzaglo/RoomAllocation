import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import roomRoutes from "./api/routes/roomRoutes.js"; // חובה לציין סיומת .js
import allocationRoutes from "./api/routes/allocationRoutes.js"; // חובה לציין סיומת .js
const app = express();

app.use(express.json());
app.use(cors());

// ניתוב הבקשות
app.use("/api/rooms", roomRoutes);
//ניתוב לשיבוצים
app.use("/api/allocations", allocationRoutes);

const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
    app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB Error:", err.message));

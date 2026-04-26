// בס"ד
import express from "express";
import { addCancellation, getAvailableRooms, updateCancellation, deleteCancellation } from "../controllers/cancellationController.js";

const router = express.Router();

// נתיב חיפוש (סטטי - תמיד לפני דינמי)
router.get("/available", getAvailableRooms);

// נתיבי ביטול (דינמיים - מקבלים מזהה חדר)
router.post("/:roomId", addCancellation);
router.patch("/:roomId/:cancelId", updateCancellation);
router.delete("/:roomId/:cancelId", deleteCancellation);

export default router;
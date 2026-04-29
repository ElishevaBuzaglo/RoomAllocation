import express from "express";
import { addCancellation, deleteCancellation } from "../controllers/cancellationController.js";

const router = express.Router();

router.post("/", addCancellation); // אין צורך ב-roomId ב-URL, הוא ב-body
router.delete("/:id", deleteCancellation); // מחיקה לפי ID של הביטול

export default router;
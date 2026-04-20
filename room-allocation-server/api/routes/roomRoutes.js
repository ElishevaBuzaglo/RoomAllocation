import express from "express";
import {
  getAllRooms,
  createRoom,
  addPermanentAssignment,
  deleteAssignment,
  clearRoomAssignments,
} from "../controllers/roomController.js";
import { getAllRooms } from "../controllers/roomController.js";

const router = express.Router();

router.get("/", getAllRooms);

router.post("/", createRoom);

// נתיב להוספת שיבוץ לחדר ספציפי
router.post("/:roomId/assignments", addPermanentAssignment);

// נתיב למחיקת שיבוץ ספציפי מתוך חדר
router.delete("/:roomId/assignments/:assignmentId", deleteAssignment);

// נתיב לניקוי כל השיבוצים בחדר
router.delete("/:roomId/assignments", clearRoomAssignments);

export default router;


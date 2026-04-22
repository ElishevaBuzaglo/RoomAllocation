import express from "express";
import { 
  createRoom, 
  getAllRooms, 
  getRoomById, 
  updateRoom, 
  deleteRoom,
  searchRooms
} from "../controllers/roomController.js";

const router = express.Router();

router.get("/search", searchRooms);

// נתיב כללי (POST ליצירה, GET לרשימה)
router.route("/")
  .post(createRoom)
  .get(getAllRooms);

// נתיב לפי ID (GET לשליפה, PUT לעדכון, DELETE למחיקה)
router.route("/:id")
  .get(getRoomById)
  .put(updateRoom)
  .delete(deleteRoom);

export default router;

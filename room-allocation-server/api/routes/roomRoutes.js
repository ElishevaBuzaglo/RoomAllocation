import express from "express";
import { 
  createRoom, 
  getAllRooms, 
  getRoomById, 
  updateRoom, 
  deleteRoom 
} from "../controllers/roomController.js";

const router = express.Router();

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
// import express from "express";
// import { 
//     createRoom, 
//     getAllRooms, 
//     getRoomById, 
//     updateRoom, 
//     deleteRoom 
// } from "../controllers/roomController.js";

// const router = express.Router();

// // נתיב ליצירת חדר וקבלת כל החדרים
// router.route("/")
//     .post(createRoom)    // POST /api/rooms
//     .get(getAllRooms);   // GET /api/rooms

// // נתיבים לחדר ספציפי לפי ID
// router.route("/:id")
//     .get(getRoomById)    // GET /api/rooms/12345 (כולל ה-Populate)
//     .put(updateRoom)    // PUT /api/rooms/12345
//     .delete(deleteRoom); // DELETE /api/rooms/12345

// export default router;
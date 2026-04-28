import express from "express";
import { 
  createRoom, 
  getAllRooms, 
  getRoomById, 
  updateRoom, 
  deleteRoom,
  searchRooms
} from "../controllers/roomController.js";
import { validateRoomSearch } from '../middlewares/roomValidation.js';

const router = express.Router();

router.route("/")
    .get(getAllRooms)
    .post(createRoom);

router.route("/:id")
    .get(getRoomById)
    .put(updateRoom)
    .delete(deleteRoom);

router.get('/search', validateRoomSearch, searchRooms);

// נתיב כללי (POST ליצירה, GET לרשימה)
router.route("/")
  .post(createRoom)
  .get(getAllRooms);

router.route("/").get(getAllRooms).post(createRoom);
router.route("/:id").get(getRoomById).delete(deleteRoom);

export default router;
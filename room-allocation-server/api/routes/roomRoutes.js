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

// חייב להיות לפני החיפוש לפי ID כי אחרת הוא יחשוב ש-"search" הוא ID
router.get('/search', validateRoomSearch, searchRooms);

router.route("/:id")
  .get(getRoomById)
  .put(updateRoom)
  .delete(deleteRoom);

export default router;
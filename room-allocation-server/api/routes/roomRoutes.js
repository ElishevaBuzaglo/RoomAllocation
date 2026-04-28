import express from "express";
import { getAllRooms, createRoom, getRoomById, deleteRoom } from "../controllers/roomController.js";
const router = express.Router();

router.route("/").get(getAllRooms).post(createRoom);
router.route("/:id").get(getRoomById).delete(deleteRoom);

export default router;
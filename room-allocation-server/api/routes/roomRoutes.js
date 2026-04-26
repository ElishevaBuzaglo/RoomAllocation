// בס"ד
import express from "express";
import { getAllRooms, createRoom, getRoomById, updateRoom, deleteRoom } from "../controllers/roomController.js";

const router = express.Router();

router.route("/")
    .get(getAllRooms)
    .post(createRoom);

router.route("/:id")
    .get(getRoomById)
    .put(updateRoom)
    .delete(deleteRoom);

export default router;
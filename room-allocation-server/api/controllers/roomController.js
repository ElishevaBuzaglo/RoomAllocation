import Room from "../models/Room.js";
import Allocation from "../models/Allocation.js";
import Cancellation from "../models/Cancellation.js";

export const createRoom = async (req, res) => {
    try {
        const newRoom = await new Room(req.body).save();
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('allocations').populate('cancellations');
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('allocations').populate('cancellations');
        if (!room) return res.status(404).json({ message: "לא נמצא" });
        res.status(200).json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Update: עדכון פרטי חדר ---
export const updateRoom = async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedRoom) return res.status(404).json({ message: "החדר לא נמצא" });
        res.status(200).json(updatedRoom);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    // ניקוי יתומים: מחיקת כל השיבוצים/ביטולים של החדר הזה
    await Allocation.deleteMany({ room: roomId });
    // מחיקת החדר
    const deletedRoom = await Room.findByIdAndDelete(roomId);
    
    if (!deletedRoom) return res.status(404).json({ message: "החדר לא נמצא" });
    res.status(200).json({ message: "החדר וכל נתוניו נמחקו בהצלחה" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Search: חיפוש חדרים לפי מאפיינים וזמינות ---
export const searchRooms = async (req, res) => {
  try {
    const { minSize, wing, floor, roomType, hasProjector } = req.query;
    // שליפת הנתונים שעברו ולידציה ב-Middleware
    const { start, end, startTimeStr, endTimeStr, dayOfWeek } = req.validatedTimes;

    let filter = {};
    if (minSize) filter.size = { $gte: Number(minSize) };
    if (wing) filter.wing = wing;
    if (floor) filter.floor = Number(floor);
    if (roomType) filter.roomType = roomType;
    if (hasProjector === 'true') filter.hasProjector = true;

    const rooms = await Room.find(filter).populate({
      path: 'allocations',
      match: {
        status: 'approved',
        $or: [
          { kind: 'permanent', dayOfWeek: dayOfWeek },
          { kind: 'temporary', startDate: { $lt: end }, endDate: { $gt: start } }
        ]
      }
    });

    const availableRooms = rooms.filter(room => {
      return !room.allocations.some(alloc => 
        alloc.startTime < endTimeStr && alloc.endTime > startTimeStr
      );
    });

    res.status(200).json(availableRooms);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
    try {
        const roomId = req.params.id;
        const deletedRoom = await Room.findByIdAndDelete(roomId);
        if (!deletedRoom) return res.status(404).json({ message: "לא נמצא" });

        await Allocation.deleteMany({ room: roomId });
        await Cancellation.deleteMany({ room: roomId });

        res.status(200).json({ message: "החדר וכל נתוניו נמחקו" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
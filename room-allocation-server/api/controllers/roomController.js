import Room from "../models/Room.js";
import Allocation from "../models/Allocation.js";

// --- Create: יצירת חדר חדש ---
export const createRoom = async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (err) {
    res.status(400).json({ message: "שגיאה ביצירת חדר", error: err.message });
  }
};

// --- Read: קבלת כל החדרים ---
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בשליפת חדרים", error: err.message });
  }
};

// --- Read: קבלת חדר ספציפי עם המערכת שלו ---
export const getRoomById = async (req, res) => {
  try {
    // כאן נכנס ה-Populate הווירטואלי שמביא את השיבוצים בזיכרון
    const room = await Room.findById(req.params.id).populate('allocations');
    if (!room) return res.status(404).json({ message: "החדר לא נמצא" });
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
      { $set: req.body },
      { new: true, runValidators: true } // מחזיר את האובייקט המעודכן ובודק תקינות
    );
    res.status(200).json(updatedRoom);
  } catch (err) {
    res.status(400).json({ message: "שגיאה בעדכון", error: err.message });
  }
};

// --- Delete: מחיקת חדר וניקוי שיבוצים ---
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
};
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
    const { 
      minSize,      // מינימום מקומות
      wing,         // אגף
      floor,        // קומה
      roomType,     // סוג חדר
      hasProjector, // האם חובה מקרן
      status        // סטטוס (למשל רק available)
    } = req.query;

    // בניית אובייקט שאילתה דינמי
    let filter = {};

    // סינון לפי קיבולת (גדול או שווה לערך שנשלח)
    if (minSize) filter.size = { $gte: Number(minSize) };

    // סינון לפי אגף
    if (wing) filter.wing = wing;

    // סינון לפי קומה
    if (floor) filter.floor = Number(floor);

    // סינון לפי סוג חדר
    if (roomType) filter.roomType = roomType;

    // סינון לפי מקרן (רק אם המשתמש ביקש ספציפית "true")
    if (hasProjector === 'true') filter.hasProjector = true;

    // סינון לפי סטטוס (ברירת מחדל בדרך כלל נרצה רק חדרים זמינים)
    if (status) filter.status = status;

    // הרצת השאילתה ב-DB כולל ה-Virtuals של השיבוצים במידת הצורך
    const rooms = await Room.find(filter).populate('allocations');

    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בחיפוש חדרים", error: err.message });
  }
};
import Room from "../models/Room.js";

// קבלת כל החדרים
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// יצירת חדר חדש
export const createRoom = async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (err) {
    res.status(400).json({ message: "שגיאה ביצירת חדר", error: err.message });
  }
};



// הוספת שיבוץ קבוע ובדיקת התנגשויות
export const addPermanentAssignment = async (req, res) => {
  const { roomId } = req.params;
  const { title, teacherName, day, startTime, endTime } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "החדר לא נמצא" });

    // בדיקת התנגשויות: מוודאים שאין שיבוץ קיים באותו יום שחופף בשעות
    // לוגיקת חפיפה: (התחלה_חדשה < סיום_קיים) וגם (סיום_חדש > התחלה_קיים)
    const hasConflict = room.assignments.some(asm => {
      return asm.day === day && startTime < asm.endTime && endTime > asm.startTime;
    });

    if (hasConflict) {
      return res.status(400).json({ message: "החדר כבר תפוס בטווח השעות המבוקש" });
    }

    // הוספת השיבוץ 
    room.assignments.push({ title, teacherName, day, startTime, endTime });
    await room.save();

    res.status(201).json({ message: "השיבוץ נוסף בהצלחה", room });
  } catch (err) {
    res.status(500).json({ message: "שגיאה בהוספת שיבוץ", error: err.message });
  }
};

// מחיקת שיבוץ קבוע 
export const deleteAssignment = async (req, res) => {
  const { roomId, assignmentId } = req.params;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "החדר לא נמצא" });

    // שימוש ב-pull של Mongoose למחיקה לפי ה-ID של הסאב-דוקומנט
    room.assignments.pull({ _id: assignmentId });
    await room.save();

    res.status(200).json({ message: "השיבוץ נמחק בהצלחה", room });
  } catch (err) {
    res.status(500).json({ message: "שגיאה במחיקת שיבוץ", error: err.message });
  }
};


// ניקוי כל השיבוצים בחדר 
export const clearRoomAssignments = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "החדר לא נמצא" });

    room.assignments = []; // ריקון המערך
    await room.save();

    res.status(200).json({ message: "כל השיבוצים בחדר נוקו", room });
  } catch (err) {
    res.status(500).json({ message: "שגיאה בניקוי שיבוצים", error: err.message });
  }
};
import Allocation from '../models/Allocation.js';

// פונקציית העזר נשארת דומה, אך מוודאת שיש את כל הנתונים
const checkOverlap = async (newAlloc, excludeId = null) => {
    const { room, kind, startDate, dayOfWeek, startTime, endTime } = newAlloc;
    const query = { 
        room, 
        _id: { $ne: excludeId },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    };

    const existingAllocations = await Allocation.find(query);
    const searchDate = startDate ? new Date(startDate) : null;

    return existingAllocations.some(existing => {
        if (kind === 'temporary') {
            if (existing.kind === 'temporary') {
                return new Date(existing.startDate).toDateString() === searchDate.toDateString();
            }
            return existing.dayOfWeek === searchDate.getDay();
        } else {
            if (existing.kind === 'permanent') {
                return existing.dayOfWeek === dayOfWeek;
            }
            return new Date(existing.startDate).getDay() === dayOfWeek;
        }
    });
};

export const createAllocation = async (req, res) => {
    try {
        if (await checkOverlap(req.body)) {
            return res.status(400).json({ message: "החדר כבר תפוס בזמן זה" });
        }
        const newAllocation = await new Allocation(req.body).save();
        res.status(201).json(newAllocation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateAllocation = async (req, res) => {
    try {
        const current = await Allocation.findById(req.params.id);
        if (!current) return res.status(404).json({ message: "לא נמצא" });

        // מיזוג נתונים קיימים עם העדכון כדי שבדיקת החפיפה תהיה אמינה
        const mergedData = { ...current.toObject(), ...req.body };
        
        if (await checkOverlap(mergedData, req.params.id)) {
            return res.status(400).json({ message: "העדכון יוצר חפיפה עם שיבוץ קיים" });
        }

        const updated = await Allocation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllAllocations = async (req, res) => {
    try {
        const allocations = await Allocation.find().populate('room');
        res.status(200).json(allocations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//  קבלת כל השיבוצים של חדר מסוים (לפי ID של חדר)
export const getAllocationsByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        // find({ room: roomId }) מחפש את כל השיבוצים שהשדה room שלהם תואם ל-ID שקיבלנו
        const allocations = await Allocation.find({ room: roomId }).populate('room');
        
        if (allocations.length === 0) {
            return res.status(200).json({ message: "לא נמצאו שיבוצים לחדר זה", data: [] });
        }

        res.status(200).json(allocations);
    } catch (error) {
        res.status(500).json({ message: "שגיאה בשליפת שיבוצים לחדר", error: error.message });
    }
};

// קבלת כל השיבוצים שמתקיימים בשעה מסוימת
// השאילתה בודקת אם שעה מסוימת נופלת בתוך טווח הזמנים
export const getAllocationsByTime = async (req, res) => {
    try {
        const { time } = req.query; // דוגמה: /api/allocations/search/time?time=10:30
        
        if (!time) {
            return res.status(400).json({ message: "יש לספק שעה לחיפוש בפורמט HH:mm" });
        }

        const allocations = await Allocation.find({
            startTime: { $lte: time }, // שעת ההתחלה קטנה או שווה לשעה המבוקשת
            endTime: { $gt: time }    // שעת הסיום גדולה מהשעה המבוקשת
        }).populate('room');

        res.status(200).json(allocations);
    } catch (error) {
        res.status(500).json({ message: "שגיאה בחיפוש לפי שעה", error: error.message });
    }
};

export const deleteAllocation = async (req, res) => {
    try {
        const deleted = await Allocation.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "לא נמצא" });
        res.status(200).json({ message: "נמחק בהצלחה" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
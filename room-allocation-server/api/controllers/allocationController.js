import Allocation from '../models/Allocation.js';

const checkOverlap = async (newAlloc, excludeId = null) => {
    const { room, kind, startDate, endDate, dayOfWeek, startTime, endTime } = newAlloc;

    const query = {
        room,
        _id: { $ne: excludeId },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    };

    const existingAllocations = await Allocation.find(query);

    return existingAllocations.some(existing => {
        // בגלל שעכשיו לכולם יש dayOfWeek, הבדיקה הראשונה היא תמיד היום בשבוע
        const sameDay = existing.dayOfWeek === dayOfWeek;
        if (!sameDay) return false;

        // אם זה אותו יום בשבוע, בודקים חפיפת תאריכים:

        // 1. קבוע מול קבוע (שניהם ללא תאריכי סוף מוגדרים או רלוונטיים)
        if (kind === 'permanent' && existing.kind === 'permanent') {
            return true;
        }

        // 2. זמני מול זמני (בודקים חפיפה בין טווחי התאריכים)
        if (kind === 'temporary' && existing.kind === 'temporary') {
            return (new Date(startDate) <= new Date(existing.endDate) &&
                new Date(endDate) >= new Date(existing.startDate));
        }

        // 3. זמני מול קבוע
        if (kind === 'temporary' && existing.kind === 'permanent') {
            // אם הם באותו יום בשבוע, והקבוע קיים "תמיד", אז יש חפיפה
            return true;
        }

        // 4. קבוע חדש מול זמני קיים
        if (kind === 'permanent' && existing.kind === 'temporary') {
            return true;
        }

        return false;
    });
};

// פונקציית עזר לבדיקה אם יום בשבוע קיים בטווח תאריכים
function checkDayInRange(start, end, targetDay) {
    let curr = new Date(start);
    while (curr <= end) {
        if (curr.getDay() === targetDay) return true;
        curr.setDate(curr.getDate() + 1);
    }
    return false;
}

export const createAllocation = async (req, res) => {
    try {
        // המרה של roomId ל-room בנתונים
        const body = req.body;
        if (body.roomId && !body.room) {
            body.room = body.roomId;
            delete body.roomId;
        }

        if (await checkOverlap(body)) {
            return res.status(400).json({ message: "החדר כבר תפוס בזמן זה" });
        }
        const newAllocation = await new Allocation(body).save();
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

export const deleteAllAllocationsByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        console.log("Room ID received:", roomId);
        console.log("Type of Room ID:", typeof roomId);
        // שמירת התוצאה של פעולת המחיקה
        const result = await Allocation.deleteMany({ room: roomId });

        // שליחת מספר הפריטים שנמחקו חזרה לקליינט
        res.status(200).json({
            message: "פעולת המחיקה הסתיימה",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
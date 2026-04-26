// בס"ד
import Room from "../models/Room.js";

// הוספת ביטול חד-פעמי לחדר 
export const addCancellation = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { date, startTime, endTime, reason, cancelledBy } = req.body;

        //cancellationsמציאת החדר והוספת הביטול למערך ה
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ message: "החדר לא נמצא" });
        }

        // דחיפת הביטול החדש למערך
        room.cancellations.push({ date, startTime, endTime, reason, cancelledBy });

        // שמירת השינויים בבסיס הנתונים
        await room.save();

        res.status(201).json({
            message: "הביטול התווסף בהצלחה",
            cancellations: room.cancellations
        });
    } catch (err) {
        res.status(400).json({ message: "שגיאה בהוספת הביטול", error: err.message });
    }
};

// עדכון ביטול ספציפי בתוך חדר
export const updateCancellation = async (req, res) => {
    try {
        const { roomId, cancelId } = req.params;

        // 1. שליפת החדר
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        // 2. איתור הביטול הספציפי בתוך המערך
        const cancellation = room.cancellations.id(cancelId);
        if (!cancellation) return res.status(404).json({ message: "Cancellation not found" });

        // 3. עדכון הערכים (שימוש ב-set מאפשר גמישות בשדות שנשלחו)
        cancellation.set(req.body);

        // 4. שמירה שמפעילה וולידציה
        await room.save();

        res.status(200).json({
            message: "Cancellation updated successfully",
            room // החזרת החדר המעודכן לטובת ה-Frontend
        });
    } catch (error) {
        res.status(400).json({
            message: "Update failed",
            error: error.message
        });
    }
};
// מחיקת ביטול מתוך חדר
export const deleteCancellation = async (req, res) => {
    try {
        const { roomId, cancelId } = req.params;

        const room = await Room.findByIdAndUpdate(
            roomId,
            { $pull: { cancellations: { _id: cancelId } } },
            { new: true }
        );

        if (!room) return res.status(404).json({ message: "החדר לא נמצא" });
        res.status(200).json({ message: "הביטול הוסר בהצלחה", room });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const getAvailableRooms = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.query;

        // בדיקת תקינות פרמטרים חובה
        if (!date || !startTime || !endTime) {
            return res.status(400).json({ message: "משתני חובה: date, startTime, endTime" });
        }

        const searchDate = new Date(date);
        const dayOfWeek = searchDate.getDay(); // 0 = ראשון, 1 = שני וכו'

        // שליפת כל החדרים כולל ה-Virtuals של ה-Allocations
        const rooms = await Room.find().populate('allocations');

        const availableRooms = rooms.filter(room => {

            // 1. בדיקת שיבוצים קבועים (Permanent Allocations)
            // מחפשים אם קיים שיבוץ ביום המבוקש שחופף בשעות
            const hasPermanentAssignment = room.allocations.some(alloc =>
                alloc.kind === 'permanent' &&
                alloc.dayOfWeek === dayOfWeek &&
                isTimeOverlapping(alloc.startTime, alloc.endTime, startTime, endTime)
            );

            // 2. בדיקת שיבוצים זמניים (Temporary Allocations)
            // מחפשים אם קיים שיבוץ בתאריך המבוקש שחופף בשעות
            const hasTemporaryAssignment = room.allocations.some(alloc =>
                alloc.kind === 'temporary' &&
                new Date(alloc.startDate).toDateString() === searchDate.toDateString() &&
                isTimeOverlapping(alloc.startTime, alloc.endTime, startTime, endTime)
            );

            // 3. בדיקת ביטולים (Cancellations)
            // בודקים אם קיים ביטול בתוך מערך ה-Cancellations של החדר שמכסה את כל חלון הזמן המבוקש
            const hasCancellation = room.cancellations.some(cancel =>
                new Date(cancel.date).toDateString() === searchDate.toDateString() &&
                isCancellationCoveringRequest(cancel.startTime, cancel.endTime, startTime, endTime)
            );

            /**
             * לוגיקת הכרעה:
             * חדר נחשב פנוי אם:
             * א. אין לו שיבוץ זמני חופף.
             * ב. וגם: (אין לו שיבוץ קבוע חופף) או (יש שיבוץ קבוע אבל הוא בוטל ספציפית בטווח הזה).
             */
            const isOccupiedByTemp = hasTemporaryAssignment;
            const isOccupiedByPerm = hasPermanentAssignment && !hasCancellation;

            return !isOccupiedByTemp && !isOccupiedByPerm;
        });

        res.status(200).json(availableRooms);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/**
 * פונקציית עזר לבדיקת חפיפה בין שני טווחי זמן.
 * נוסחה: (StartA < EndB) וגם (StartB < EndA)
 */
const isTimeOverlapping = (startA, endA, startB, endB) => {
    return startA < endB && startB < endA;
};

/**
 * פונקציית עזר לבדיקה האם ביטול "מכסה" את כל טווח הזמן המבוקש.
 * כדי שחדר יהיה פנוי באמת, הביטול חייב להתחיל לפני/בזמן הבקשה ולהסתיים אחרי/בזמן סיום הבקשה.
 */
const isCancellationCoveringRequest = (cancelStart, cancelEnd, reqStart, reqEnd) => {
    return cancelStart <= reqStart && cancelEnd >= reqEnd;
};

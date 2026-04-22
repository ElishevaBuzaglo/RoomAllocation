import Allocation from '../models/Allocation.js';

// 1. לקבל את כל השיבוצים
export const getAllAllocations = async (req, res) => {
    try {
        const allocations = await Allocation.find().populate('room');
        res.status(200).json(allocations);
    } catch (error) {
        res.status(500).json({ message: "שגיאה בשליפת כל השיבוצים", error: error.message });
    }
};

// 2. לקבל את כל השיבוצים של חדר מסוים (לפי ID של חדר)
export const getAllocationsByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const allocations = await Allocation.find({ room: roomId }).populate('room');
        res.status(200).json(allocations);
    } catch (error) {
        res.status(500).json({ message: "שגיאה בשליפת שיבוצים לחדר", error: error.message });
    }
};

// 3. לקבל את כל השיבוצים שמתקיימים בשעה מסוימת
// השאילתה בודקת אם השעה המבוקשת נמצאת בטווח שבין startTime ל-endTime
export const getAllocationsByTime = async (req, res) => {
    try {
        const { time } = req.query; // למשל: /api/allocations/search/time?time=10:30
        
        if (!time) {
            return res.status(400).json({ message: "יש לספק שעה לחיפוש" });
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

// הוספת שיבוץ חדש
export const createAllocation = async (req, res) => {
    try {
        // אנחנו מצפים לקבל ב-req.body את כל השדות: room, requesterName, kind, startTime, וכו'
        const newAllocation = new Allocation(req.body);

        // שמירה במסד הנתונים - כאן מופעלות כל הולידציות של הסכמה
        const savedAllocation = await newAllocation.save();

        // החזרת תשובה חיובית עם האובייקט שנוצר
        res.status(201).json({
            message: "השיבוץ נוצר בהצלחה",
            data: savedAllocation
        });
    } catch (error) {
        // אם הולידציה נכשלה (למשל: חסר יום בשבוע בשיבוץ קבוע) - תחזור שגיאה מפורטת
        res.status(400).json({ 
            message: "שגיאה ביצירת השיבוץ - נתונים לא תקינים", 
            error: error.message 
        });
    }
};

// --- עדכון שיבוץ קיים ---
export const updateAllocation = async (req, res) => {
    try {
        const { id } = req.params;

        // הפונקציה מוצאת ומעדכנת בבת אחת
        const updatedAllocation = await Allocation.findByIdAndUpdate(
            id, 
            req.body, 
            { 
                new: true, // מחזיר את האובייקט *אחרי* השינוי ולא לפניו
                runValidators: true // מוודא שהעדכון לא מפר את חוקי הסכמה (למשל יום לא תקין)
            }
        );

        if (!updatedAllocation) {
            return res.status(404).json({ message: "השיבוץ לא נמצא במערכת" });
        }

        res.status(200).json({
            message: "השיבוץ עודכן בהצלחה",
            data: updatedAllocation
        });
    } catch (error) {
        res.status(400).json({ message: "שגיאה בעדכון השיבוץ", error: error.message });
    }
};

// --- מחיקת שיבוץ ---
export const deleteAllocation = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAllocation = await Allocation.findByIdAndDelete(id);

        if (!deletedAllocation) {
            return res.status(404).json({ message: "לא נמצא שיבוץ כזה למחיקה" });
        }

        res.status(200).json({
            message: "השיבוץ הוסר מהמערכת בהצלחה"
        });
    } catch (error) {
        res.status(500).json({ message: "שגיאה בתהליך המחיקה", error: error.message });
    }
};
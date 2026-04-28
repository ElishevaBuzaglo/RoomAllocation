// middleware/validateSearch.js
export const validateRoomSearch = (req, res, next) => {
    const { searchStart, searchEnd } = req.query;

    // 1. בדיקת קיום
    if (!searchStart || !searchEnd) {
        return res.status(400).json({ 
            message: "חובה לשלוח זמן התחלה (searchStart) וזמן סיום (searchEnd)" 
        });
    }

    const start = new Date(searchStart);
    const end = new Date(searchEnd);

    // 2. בדיקת תקינות פורמט
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ 
            message: "פורמט תאריך לא תקין. השתמש ב-ISO String" 
        });
    }

    // 3. בדיקה לוגית
    if (start >= end) {
        return res.status(400).json({ 
            message: "זמן סיום חייב להיות אחרי זמן התחלה" 
        });
    }

    // אם הכל תקין, נעביר את הנתונים המעובדים לאובייקט ה-req כדי לחסוך המרה נוספת ב-Controller
    req.validatedTimes = {
        start,
        end,
        startTimeStr: start.toTimeString().substring(0, 5),
        endTimeStr: end.toTimeString().substring(0, 5),
        dayOfWeek: start.getDay()
    };

    next(); // ממשיך לפונקציה הבאה (ל-Controller)
};
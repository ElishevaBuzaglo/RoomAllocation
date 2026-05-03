import "dotenv/config";
import mongoose from "mongoose";
import Room from "./api/models/Room.js";
import Allocation from "./api/models/Allocation.js";
import Cancellation from "./api/models/Cancellation.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/room-allocation";

console.log("🔍 משתמש ב-URI:", MONGO_URI);

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✓ מחובר למסד הנתונים");

        // ניקוי נתונים קודמים
        await Room.deleteMany({});
        await Allocation.deleteMany({});
        await Cancellation.deleteMany({});
        console.log("✓ נתונים קודמים נמחקו");

        // יצירת חדרים
        const rooms = await Room.insertMany([
            {
                roomNumber: "101",
                wing: "A",
                floor: 1,
                size: 30,
                hasProjector: true,
                roomType: "כיתה"
            },
            {
                roomNumber: "102",
                wing: "A",
                floor: 1,
                size: 50,
                hasProjector: true,
                roomType: "אולם"
            },
            {
                roomNumber: "201",
                wing: "B",
                floor: 2,
                size: 20,
                hasProjector: false,
                roomType: "חדר ישיבות"
            }
        ]);
        console.log(`✓ ${rooms.length} חדרים נוצרו`);

        // יצירת שיבוצים (allocations)
        const allocations = await Allocation.insertMany([
            {
                room: rooms[0]._id,
                requesterName: "דר. כהן",
                kind: "permanent",
                dayOfWeek: 3, // רביעי - כמו 2026-05-01
                startTime: "10:00",
                endTime: "11:00",
                status: "approved"
            },



            {
                room: rooms[0]._id,
                dayOfWeek: 1, // שני - כמו 2026-05-04
                requesterName: "פרופ. לוי",
                kind: "temporary",
                startDate: new Date("2026-05-01"),
                endDate: new Date("2026-05-02"),
                startTime: "14:00",
                endTime: "16:00",
                status: "approved"
            },
            {
                room: rooms[1]._id,
                requesterName: "פרופ. ברק",
                kind: "permanent",
                dayOfWeek: 2, // שלישי
                startTime: "09:00",
                endTime: "12:00",
                status: "approved"
            }
        ]);
        console.log(`✓ ${allocations.length} שיבוצים נוצרו`);

        // יצירת ביטולים (cancellations) - לבדיקה
        const cancellations = await Cancellation.insertMany([
            {
                room: rooms[0]._id,
                date: new Date("2026-05-01"),
                startTime: "10:00",
                endTime: "11:00",
                reason: "חזר כל הכיתה בגלל מחלה",
                cancelledBy: "אדמיניסטרציה"
            }
        ]);
        console.log(`✓ ${cancellations.length} ביטולים נוצרו`);

        console.log("\n✅ בסיס הנתונים הוכן לטיסטינג!");
        console.log("\nנתונים לבדיקה:");
        console.log("- חדר 101: allocation קבוע ביום רביעי 10:00-11:00 (עם ביטול לתאריך מסוים)");
        console.log("- חדר 101: allocation זמני 14:00-16:00 (1 במאי - רביעי)");
        console.log("- חדר 102: allocation קבוע ביום שלישי 09:00-12:00");
        console.log("- חדר 201: ללא allocations");
        console.log("\n📝 דוגמאות לחיפוש:");
        console.log("- בדוק ב-1 במאי (רביעי) 10:00-11:00 → צריך להחזיר חדר 101 (עם ביטול) וחדרים אחרים");

        process.exit(0);
    } catch (err) {
        console.error("❌ שגיאה:", err.message);
        process.exit(1);
    }
}

seedDatabase();

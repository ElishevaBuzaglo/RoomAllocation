import mongoose from "mongoose";

// סכמת משנה לשיבוץ (כדי לשמור על סדר)
const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },     // שם השיעור / אירוע
  teacherName: String,                         // שם המרצה/מורה
  day: { type: String, 
    enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], 
    required: true },       // יום בשבוע (למשל: "ראשון")
  startTime: { type: String, required: true }, // פורמט "HH:mm"
  endTime: { type: String, required: true },   // פורמט "HH:mm"
  isPermanent: { type: Boolean, default: true }, // האם זה שיבוץ קבוע למערכת או חד פעמי
  startDate: Date,                             // תאריך התחלה (אופציונלי)
  endDate: Date                                // תאריך סיום (אופציונלי)
}, { _id: true }); // אנחנו רוצים ID לכל שיבוץ כדי שנוכל למחוק אותו בקלות

// סכמת משנה לביטול/חריגה
const CancellationSchema = new mongoose.Schema({
  date: { type: Date, required: true },        // התאריך הספציפי שבו בוטל החדר
  reason: String,                              // סיבת הביטול
  cancelledBy: String                          // מי ביטל
}, { _id: true });

// הסכמה הראשית של החדר
const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true }, // מספר חדר (למשל "101")
  wing: { type: String, required: true },       // אגף (למשל "אגף א'")
  floor: { type: Number, required: true },      // קומה
  size: { type: Number, required: true },       // קיבולת (כמה אנשים נכנסים)
  hasProjector: { type: Boolean, default: false }, // האם יש מקרן
  roomType: { 
    type: String, 
    enum: ["כיתה", "מעבדה", "אולם", "חדר ישיבות","חדר מחשבים"], 
    default: "כיתה" 
  },
  status: { 
    type: String, 
    enum: ["available", "maintenance", "occupied"], 
    default: "available" 
  },
  
  // מערך שיבוצים (Assignments)
  assignments: [AssignmentSchema],
  
  // מערך ביטולים (Cancellations)
  cancellations: [CancellationSchema]

}, { timestamps: true }); // מוסיף אוטומטית createdAt ו-updatedAt

export default mongoose.model("Room", RoomSchema, "Rooms");
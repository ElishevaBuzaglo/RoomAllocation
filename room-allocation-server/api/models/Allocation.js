import mongoose from 'mongoose';

const AllocationSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
        index: true // אינדקס לשליפה מהירה של מערכת שעות לחדר
    },
    requesterName: {
        type: String,
        required: true
    },
    // סוג השיבוץ: קבוע (מערכת שבועית) או זמני (תאריך ספציפי)
    kind: {
        type: String,
        enum: ['permanent', 'temporary'],
        required: true
    },
    // עבור שיבוץ זמני או שחרור חדר (סעיף 11 באפיון)
    startDate: {
        type: Date,
        required: function() { return this.kind === 'temporary'; }
    },
    endDate: {
        type: Date,
        required: function() { return this.kind === 'temporary'; }
    },
    // עבור שיבוץ קבוע: יום בשבוע (0=ראשון, 1=שני...)
    dayOfWeek: {
        type: Number,
        min: 0,
        max: 6,
        required: function() { return this.kind === 'permanent'; }
    },
    // שעות השיבוץ - חובה תמיד, גם לקבוע וגם לזמני
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true }, 

    // מנגנון ביטול/שחרור חדר (סעיף 11 באפיון)
    isReleaseOnly: {
        type: Boolean,
        default: false
    },
    cancellationReason: {
        type: String,
        // השדה הופך לחובה רק כשמדובר בביטול/שחרור
        required: function() { return this.isReleaseOnly === true; }
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    notes: String 
}, { timestamps: true });

// אינדקס משולב למניעת כפילויות וחיפוש זמינות חכם ברמת ה-Database
AllocationSchema.index({ room: 1, startDate: 1, dayOfWeek: 1 });

export default mongoose.model('Allocation', AllocationSchema, 'Allocations');
// import mongoose from 'mongoose';

// const AllocationSchema = new mongoose.Schema({
//     // קישור לחדר הרלוונטי
//     room: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Room',
//         required: true
//     },
//     // מי מבקש את החדר (סטודנטית, מרצה, או קבוצה)
//     requesterName: {
//         type: String,
//         required: true
//     },
//     // סוג השיבוץ: קבוע (למשל כל יום שלישי) או זמני (תאריך ספציפי)
//     kind: {
//         type: String,
//         enum: ['permanent', 'temporary'],
//         required: true
//     },
//     // תאריך התחלה וסיום (עבור שיבוץ זמני)
//     startDate: {
//         type: Date,
//         required: function() { return this.kind === 'temporary'; }
//     },
//     endDate: {
//         type: Date,
//         required: function() { return this.kind === 'temporary'; }
//     },
//     // עבור שיבוץ קבוע: באיזה יום בשבוע?
//     dayOfWeek: {
//         type: String,
//         enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
//         required: function() { return this.kind === 'permanent'; }
//     },
//     // שעות השיבוץ (רלוונטי לשני הסוגים)
//     startTime: String, // למשל "08:00"
//     endTime: String,   // למשל "10:00"

//     // שדה חשוב: האם זו בקשת "שחרור" חדר? 
//     // (למשל: חדר קבוע שמתפנה זמנית לצורך הכנה למבחן)
//     isReleaseOnly: {
//         type: Boolean,
//         default: false
//     },

//     status: {
//         type: String,
//         enum: ['pending', 'approved', 'rejected'],
//         default: 'pending'
//     },
    
//     notes: String // למשל: "צריכות מקרר עבור הקייטרינג"
// }, { timestamps: true });

// export default mongoose.model('Allocation', AllocationSchema, 'Allocations');
// import mongoose from 'mongoose';

// const AllocationSchema = new mongoose.Schema({
//     room: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Room',
//         required: true,
//         index: true // אינדקס לשליפה מהירה של מערכת שעות לחדר
//     },
//     requesterName: {
//         type: String,
//         required: true
//     },
//     // סוג השיבוץ: קבוע (למשל כל יום שלישי) או זמני (תאריך ספציפי)
//     kind: {
//         type: String,
//         enum: ['permanent', 'temporary'],
//         required: true
//     },
//     // עבור שיבוץ זמני או שחרור חדר (סעיף 11 באפיון)
//     startDate: {
//         type: Date,
//         required: function() { return this.kind === 'temporary'; }
//     },
//     endDate: {
//         type: Date,
//         required: function() { return this.kind === 'temporary'; }
//     },
//     // עבור שיבוץ קבוע: יום בשבוע (0=ראשון, 1=שני...)
//     dayOfWeek: {
//         type: Number,
//         min: 0,
//         max: 6,
//         required: function() { return this.kind === 'permanent'; }
//     },
//     // שעות השיבוץ (פורמט "HH:mm")
//     startTime: { 
//         type: String, 
//         required: true 
//     },
//     endTime: { 
//         type: String, 
//         required: true 
//     },
//     // שדה קריטי לשחרור חדר זמני (סעיף 11 באפיון)
//     isReleaseOnly: {
//         type: Boolean,
//         default: false
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'approved', 'rejected'],
//         default: 'pending'
//     },
//     notes: String 
// }, { timestamps: true });

// // אינדקס משולב למניעת כפילויות וחיפוש זמינות חכם
// AllocationSchema.index({ room: 1, startDate: 1, dayOfWeek: 1 });

// export default mongoose.model('Allocation', AllocationSchema, 'Allocations');
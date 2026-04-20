import mongoose from 'mongoose';

const AllocationSchema = new mongoose.Schema({
    // קישור לחדר הרלוונטי
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    // מי מבקש את החדר (סטודנטית, מרצה, או קבוצה)
    requesterName: {
        type: String,
        required: true
    },
    // סוג השיבוץ: קבוע (למשל כל יום שלישי) או זמני (תאריך ספציפי)
    kind: {
        type: String,
        enum: ['permanent', 'temporary'],
        required: true
    },
    // תאריך התחלה וסיום (עבור שיבוץ זמני)
    startDate: {
        type: Date,
        required: function() { return this.kind === 'temporary'; }
    },
    endDate: {
        type: Date,
        required: function() { return this.kind === 'temporary'; }
    },
    // עבור שיבוץ קבוע: באיזה יום בשבוע?
    dayOfWeek: {
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        required: function() { return this.kind === 'permanent'; }
    },
    // שעות השיבוץ (רלוונטי לשני הסוגים)
    startTime: String, // למשל "08:00"
    endTime: String,   // למשל "10:00"

    // שדה חשוב: האם זו בקשת "שחרור" חדר? 
    // (למשל: חדר קבוע שמתפנה זמנית לצורך הכנה למבחן)
    isReleaseOnly: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    
    notes: String // למשל: "צריכות מקרר עבור הקייטרינג"
}, { timestamps: true });

export default mongoose.model('Allocation', AllocationSchema, 'Allocations');
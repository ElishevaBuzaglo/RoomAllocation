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

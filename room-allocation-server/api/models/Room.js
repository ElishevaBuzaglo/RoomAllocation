import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  wing: { 
    type: String, 
    required: true // אגף (למשל: אגף א')
  },
  floor: { 
    type: Number, 
    required: true // קומה
  },
  size: { 
    type: Number, 
    required: true // קיבולת/גודל החדר
  },
  hasProjector: { 
    type: Boolean, 
    default: false // האם קיים מקרן
  },
  roomType: { 
    type: String,
    enum: ["כיתה", "מעבדה", "אולם", "חדר ישיבות", "חדר מחשבים"],
    default: "כיתה"
  },
  status: {
    type: String, 
    enum: ["available", "maintenance", "occupied"], 
    default: "available" 
  }
}, { 
  timestamps: true,
  // הגדרות אלו מאפשרות ל-Virtuals (השיבוצים) לעבור לצד הלקוח (React)
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// הגדרת קשר וירטואלי - מאחד את השיבוצים בזיכרון בלי להכביד על הדיסק
RoomSchema.virtual('allocations', {
  ref: 'Allocation',      
  localField: '_id',      
  foreignField: 'room'    
});

export default mongoose.model("Room", RoomSchema, "Rooms");

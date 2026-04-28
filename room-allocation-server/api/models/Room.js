import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true, trim: true },
  wing: { type: String, required: true },
  floor: { type: Number, required: true },
  size: { type: Number, required: true },
  hasProjector: { type: Boolean, default: false },
  roomType: { 
    type: String, 
    enum: ["כיתה", "מעבדה", "אולם", "חדר ישיבות", "חדר מחשבים"], 
    default: "כיתה" 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

RoomSchema.virtual('allocations', {
  ref: 'Allocation',
  localField: '_id',
  foreignField: 'room'
});

RoomSchema.virtual('cancellations', {
  ref: 'Cancellation',
  localField: '_id',
  foreignField: 'room'
});

export default mongoose.model("Room", RoomSchema);
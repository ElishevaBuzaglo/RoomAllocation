import mongoose from 'mongoose';

const AllocationSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  requesterName: { type: String, required: true },
  kind: { type: String, enum: ['permanent', 'temporary'], required: true },
  startDate: {
    type: Date,
    required: function () { return this.kind === 'temporary'; }
  },
  endDate: {
    type: Date,
    required: function () { return this.kind === 'temporary'; }
  },
  dayOfWeek: {
    type: Number,
    min: 0, max: 6
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'approved' }
}, { timestamps: true });

export default mongoose.model('Allocation', AllocationSchema);
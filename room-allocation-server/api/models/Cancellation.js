// // const CancellationSchema = new mongoose.Schema({
// //   room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
// //   date: { type: Date, required: true }, // התאריך הספציפי שבו הביטול תקף
// //   startTime: { type: String, required: true },
// //   endTime: { type: String, required: true },
// //   reason: { type: String },
// //   cancelledBy: { type: String, required: true }
// // }, { timestamps: true });
// import mongoose from 'mongoose';

// const CancellationSchema = new mongoose.Schema({
//   room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
//   date: { type: Date, required: true },
//   startTime: { type: String, required: true },
//   endTime: { type: String, required: true },
//   reason: { type: String },
//   cancelledBy: { type: String, required: true }
// }, { timestamps: true });

// export default mongoose.model('Cancellation', CancellationSchema);

import mongoose from 'mongoose';

const CancellationSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  reason: { type: String },
  cancelledBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Cancellation', CancellationSchema);
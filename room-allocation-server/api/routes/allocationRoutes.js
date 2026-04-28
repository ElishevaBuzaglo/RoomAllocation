// // import express from 'express';
// // import { 
// //     getAllAllocations, 
// //     getAllocationsByRoom, 
// //     getAllocationsByTime,
// //     createAllocation,
// //     updateAllocation,
// //     deleteAllocation
// // } from '../controllers/allocationController.js';

// // const router = express.Router();

// // // 1. כל השיבוצים
// // router.get('/', getAllAllocations);

// // // 3. חיפוש לפי שעה (שימי לב: שמתי את זה לפני ה-ID כדי שלא יהיה בלבול בנתיבים)
// // router.get('/search/time', getAllocationsByTime);

// // // 2. כל השיבוצים של חדר מסוים
// // router.get('/room/:roomId', getAllocationsByRoom);

// // // יצירת שיבוץ חדש
// // router.post('/', createAllocation);
// // // --- שינוי ומחיקה (מבוססי ID) ---
// // router.patch('/:id', updateAllocation);  // שימוש ב-PATCH לעדכון חלקי
// // router.delete('/:id', deleteAllocation);
// // export default router;



// import express from 'express';
// import { 
//     getAllAllocations, 
//     getAllocationsByRoom, 
//     getAllocationsByTime,
//     createAllocation,
//     updateAllocation,
//     deleteAllocation
// } from '../controllers/allocationController.js';

// const router = express.Router();

// router.get('/', getAllAllocations);
// router.get('/search/time', getAllocationsByTime);
// router.get('/room/:roomId', getAllocationsByRoom);
// router.post('/', createAllocation);
// router.patch('/:id', updateAllocation);
// router.delete('/:id', deleteAllocation);

// export default router;

import express from 'express';
import { getAllAllocations, createAllocation, updateAllocation, deleteAllocation } from '../controllers/allocationController.js';
const router = express.Router();

router.get('/', getAllAllocations);
router.post('/', createAllocation);
router.patch('/:id', updateAllocation);
router.delete('/:id', deleteAllocation);

export default router;
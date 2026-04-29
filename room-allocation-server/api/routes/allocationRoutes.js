import express from 'express';
import { getAllAllocations, createAllocation, updateAllocation, deleteAllAllocationsByRoom } from '../controllers/allocationController.js';
const router = express.Router();

router.get('/', getAllAllocations);
router.post('/', createAllocation);
router.patch('/:id', updateAllocation);
router.delete('/room/:roomId', deleteAllAllocationsByRoom);

export default router;
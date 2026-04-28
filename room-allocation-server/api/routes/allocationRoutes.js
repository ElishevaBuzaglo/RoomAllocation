import express from 'express';
import { getAllAllocations, createAllocation, updateAllocation, deleteAllocation } from '../controllers/allocationController.js';
const router = express.Router();

router.get('/', getAllAllocations);
router.post('/', createAllocation);
router.patch('/:id', updateAllocation);
router.delete('/:id', deleteAllocation);

export default router;
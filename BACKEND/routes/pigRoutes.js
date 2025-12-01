import express from 'express';
import { addPig, getAllUserPigs, getPigsByFarm, getPigWeights, addWeightRecord, updateWeightRecord, deleteWeightRecord, updatePig, deletePig } from '../Controllers/pigController.js';

const router = express.Router();

router.post('/add-pig', addPig);
router.post('/get-user-pigs', getAllUserPigs);
router.post('/get-pigs-by-farm', getPigsByFarm);
router.get('/:pigId/weights', getPigWeights);

// Pig endpoints
router.put('/:pigId', updatePig);
router.delete('/:pigId', deletePig);

// Weight Records endpoints
router.post('/:pigId/weights', addWeightRecord);
router.put('/:pigId/weights/:weightId', updateWeightRecord);
router.delete('/:pigId/weights/:weightId', deleteWeightRecord);

export default router;
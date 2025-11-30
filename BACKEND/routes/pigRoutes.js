import express from 'express';
import { addPig, getAllUserPigs, getPigsByFarm } from '../Controllers/pigController.js';

const router = express.Router();

router.post('/add-pig', addPig);
router.post('/get-user-pigs', getAllUserPigs);
router.post('/get-pigs-by-farm', getPigsByFarm);

export default router;
import express from 'express';
import { createFarm, getAllUserFarms, renameFarmController, deleteFarmController } from '../Controllers/farmController.js';

const router = express.Router();

router.post('/add-farm', createFarm);
router.post('/get-user-farms', getAllUserFarms);
router.post('/rename-farm', renameFarmController);
router.post('/delete-farm', deleteFarmController);

export default router;
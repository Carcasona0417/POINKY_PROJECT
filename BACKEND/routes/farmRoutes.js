import express from 'express';
import { createFarm, getAllUserFarms } from '../Controllers/farmController.js';

const router = express.Router();

router.post('/add-farm', createFarm);
router.post('/get-user-farms', getAllUserFarms);

export default router;
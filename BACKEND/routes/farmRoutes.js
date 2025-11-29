import express from 'express';
import { createFarm } from '../Controllers/farmController.js';

const router = express.Router();

router.post('/add-farm', createFarm)

export default router;
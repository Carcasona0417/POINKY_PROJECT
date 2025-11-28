import express from 'express';
import { addPig } from '../Controllers/pigController.js';

const router = express.Router();

router.post('/add-pig', addPig);

export default router;

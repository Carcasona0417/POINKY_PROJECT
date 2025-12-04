import express from 'express';
import { createVaccination, fetchVaccinations, modifyVaccination, removeVaccination } from '../Controllers/vacciController.js';

const router = express.Router();

router.post('/add-vaccination', createVaccination);
router.get('/get-vaccinations', fetchVaccinations);
router.post('/update-vaccination', modifyVaccination);
router.post('/delete-vaccination', removeVaccination);

export default router;
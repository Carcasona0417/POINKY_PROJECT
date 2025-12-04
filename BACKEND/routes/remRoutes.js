import express from 'express';
import {
    getReminders,
    createReminder,
    editReminder,
    removeReminder
} from '../Controllers/remController.js';


const router = express.Router();
router.post('/get-reminders', getReminders);
router.post('/add-reminder', createReminder);
// Update and delete follow RESTful pattern
// Accept the reminder ID as a URL parameter so controller receives `req.params.remID`
router.post('/edit-reminder/:remID', editReminder);
router.delete('/:remID', removeReminder);


export default router;

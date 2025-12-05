import { fetchNotifications } from "../Controllers/notifController.js";
import express from 'express';

const router = express.Router();

router.post('/fetch-notifications', fetchNotifications);

export default router;

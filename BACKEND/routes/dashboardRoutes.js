import express from 'express';
import {
    getDashboardStats,
    getTotalFarmsData,
    getTotalPigsData,
    getMonthExpensesData,
    getUpcomingRemindersData,
    getBarChartData,
    getPieChartData
} from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard routes
router.post('/stats', getDashboardStats);
router.post('/total-farms', getTotalFarmsData);
router.post('/total-pigs', getTotalPigsData);
router.post('/month-expenses', getMonthExpensesData);
router.post('/upcoming-reminders', getUpcomingRemindersData);
router.post('/chart-data', getBarChartData);
router.post('/pie-chart', getPieChartData);

export default router;

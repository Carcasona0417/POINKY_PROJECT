import express from 'express';
import {
    getUserExpensesData,
    getUserTableData,
    getSoldTabledata,
    getTotalExpensesData
    // add more later here
} from '../Controllers/expincController.js';

const router = express.Router();

router.post('/Expenses-Income', getUserExpensesData );
router.post('/Expenses-Table', getUserTableData);
router.post('/PigSold-Table', getSoldTabledata);
router.post('/Total-Expenses', getTotalExpensesData);

export default router;

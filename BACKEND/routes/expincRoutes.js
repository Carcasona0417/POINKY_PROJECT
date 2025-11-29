import express from 'express';
import {
    getUserExpensesData,
    getUserTableData,
    getSoldTabledata
    // add more later here
} from '../Controllers/expincController.js';

const router = express.Router();

router.post('/Expenses-Income', getUserExpensesData );
router.post('/Expenses-Table', getUserTableData);
router.post('/PigSold-Table', getSoldTabledata);

export default router;

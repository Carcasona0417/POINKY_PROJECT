import express from 'express';
import {
    getUserExpensesData,
    getUserTableData,
    getSoldTabledata,
    getTotalExpensesData,
    getEstimatedIncomeData,
    getProjectedProfitData,
    getFeedExpensesData,
    getMedicineExpensesData,
    getTransportationExpensesData,
    getPigletsExpensesData,
    getLaborExpensesData,
    getUtilitiesExpensesData,
    getFarmsDropdown,
    getPigsDropdown,
    getCategoriesDropdown,
    addNewExpense,
    editExistingExpense,
    deleteExistingExpense,
    cancelSoldPigRecord
} from '../Controllers/expincController.js';

const router = express.Router();

// ============================================
// EXISTING ROUTES
// ============================================
router.post('/Expenses-Income', getUserExpensesData );
router.post('/Expenses-Table', getUserTableData);
router.post('/PigSold-Table', getSoldTabledata);
router.post('/Total-Expenses', getTotalExpensesData);
router.post('/Estimated-Income', getEstimatedIncomeData);
router.post('/Projected-Profit', getProjectedProfitData);
router.post('/Feed-Expenses', getFeedExpensesData);
router.post('/Medicine-Expenses', getMedicineExpensesData);
router.post('/Transportation-Expenses', getTransportationExpensesData);
router.post('/Piglets-Expenses', getPigletsExpensesData);
router.post('/Labor-Expenses', getLaborExpensesData);
router.post('/Utilities-Expenses', getUtilitiesExpensesData);

// ============================================
// DROPDOWN FILTER ROUTES
// ============================================
router.post('/dropdown-farms', getFarmsDropdown);
router.post('/dropdown-pigs', getPigsDropdown);
router.post('/dropdown-categories', getCategoriesDropdown);

// ============================================
// EXPENSE CRUD ROUTES
// ============================================
router.post('/add-expense', addNewExpense);
router.post('/edit-expense', editExistingExpense);
router.post('/delete-expense', deleteExistingExpense);

// ============================================
// SOLD PIG MANAGEMENT ROUTES
// ============================================
router.post('/cancel-sold-pig', cancelSoldPigRecord);

export default router;

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
    cancelSoldPigRecord,
    getUserExpensesDataFiltered,
    getTotalExpensesDataFiltered,
    getEstimatedIncomeDataFiltered,
    getProjectedProfitDataFiltered,
    getFeedExpensesDataFiltered,
    getMedicineExpensesDataFiltered,
    getTransportationExpensesDataFiltered,
    getPigletsExpensesDataFiltered,
    getLaborExpensesDataFiltered,
    getUtilitiesExpensesDataFiltered
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

// ============================================
// FILTERED ROUTES (with farm, pig, month, year filters)
// ============================================
router.post('/Expenses-Income-Filtered', getUserExpensesDataFiltered);
router.post('/Total-Expenses-Filtered', getTotalExpensesDataFiltered);
router.post('/Estimated-Income-Filtered', getEstimatedIncomeDataFiltered);
router.post('/Projected-Profit-Filtered', getProjectedProfitDataFiltered);
router.post('/Feed-Expenses-Filtered', getFeedExpensesDataFiltered);
router.post('/Medicine-Expenses-Filtered', getMedicineExpensesDataFiltered);
router.post('/Transportation-Expenses-Filtered', getTransportationExpensesDataFiltered);
router.post('/Piglets-Expenses-Filtered', getPigletsExpensesDataFiltered);
router.post('/Labor-Expenses-Filtered', getLaborExpensesDataFiltered);
router.post('/Utilities-Expenses-Filtered', getUtilitiesExpensesDataFiltered);

export default router;

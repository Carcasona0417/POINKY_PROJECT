import { getUserExpenses, getUserExpensesTable, getSoldTable, getTotalExpenses } from "../Logic/ExpensesIncome.js";

// BAR CHART
export const getUserExpensesData = async(req, res, next) => {
    try {
        const {userId} = req.body;
        const rows = await getUserExpenses(userId);
        res.send({ EIData: rows });
    } catch (err){
        next(err);
    }
}

// EXPENSES FULL LIST TABLE
export const getUserTableData = async(req, res, next) => {
    try{
        const {userId} = req.body;
        const rows = await getUserExpensesTable(userId);
        res.send({ExpenseTable: rows});
    } catch (err){
        next(err);
    }
}

// SOLD PIGS TABLE
export const getSoldTabledata = async(req, res, next) => {
    try{
        const {userId} = req.body;
        const rows = await getSoldTable(userId);
        res.send({SoldTable: rows})
    } catch (err){
        next(err);
    }
}

// SUMMARY FOR EXPENSES REPORTS
export const getTotalExpensesData = async(req, res, next) => {
    try{
        const {userId} = req.body;
        const rows = await getTotalExpenses(userId);
        res.send({TotalExpense: rows})
    } catch (err){
        next(err);
    }
}

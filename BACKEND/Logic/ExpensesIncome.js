import { pool } from "../Database/db.js";

// Generate unique Expense ID
async function generateExpenseID() {
    const [rows] = await pool.query(`
        SELECT ExpID 
        FROM expenses 
        ORDER BY ExpID DESC 
        LIMIT 1
    `);

    if (rows.length === 0) return "E001";

    const lastID = rows[0].ExpID; // E005
    // Extract trailing numeric portion to support different prefixes
    const m = String(lastID).match(/(\d+)$/);
    const lastNum = m ? parseInt(m[1], 10) : 0;
    const number = lastNum + 1;

    // Use short 'E' prefix to match desired format like E001
    return "E" + number.toString().padStart(3, "0");
}

// this for barchart
export async function getUserExpenses(userId){
    const [rows] = await pool.query(`
        SELECT MONTH(Date) as month,
        SUM(CASE WHEN Category = 'Sold' THEN Amount ELSE 0 END) AS income,
        SUM(CASE WHEN Category != 'Sold' THEN Amount ELSE 0 END) AS expenses
        FROM expenses
        WHERE UserID = ?
        GROUP BY MONTH(Date)
        ORDER BY month
        `, [userId]);

        const result = [];
        for (let m = 1; m <= 12; m++){
            const row = rows.find(r => r.month === m );
            result.push({
                month: m,
                income: row?.income || 0,
                expenses: row?.expenses || 0
            });
        }
        return result;
    }

    // for table expenses
export async function getUserExpensesTable(userId) {
    const [rows] = await pool.query(`
        SELECT
            e.ExpID AS ExpID,
            e.PigID AS PigID,
            DATE_FORMAT(e.Date, '%Y-%m-%d') AS ExpenseDate,
            f.FarmName AS FarmName,
            p.PigName AS PigName,
            e.Category AS Category,
            e.Amount AS Amount
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        WHERE e.UserID = ? AND e.Category != 'Sold'
        ORDER BY e.Date DESC
    `, [userId]);

    return rows;
}
// FOR SOLD TABLES
export async function getSoldTable(userId) {
    const [rows] = await pool.query(`
        SELECT
        e.ExpID AS ExpID,
        DATE_FORMAT(e.Date, '%Y-%m-%d') AS DateSold,
        f.FarmName AS FarmName,
        p.PigName AS PigName,
        w.Weight AS Weight,
        e.Category AS Category,
        e.Amount AS PricePerKg,
        w.Weight * e.Amount AS TotalPrice
        FROM expenses e
        JOIN pig p ON e.PigID = p.PigID
        JOIN farm f ON p.FarmID = f.FarmID
        JOIN weight_records w ON w.PigID = p.PigID
        WHERE e.UserID = ? 
        AND e.Category = 'Sold'
        AND w.Date = (SELECT MAX(Date) FROM weight_records WHERE PigID = p.PigID)
        ORDER BY e.Date DESC
        `, [userId]);

        return rows;
}

/*---------------------
|SUMMARY CALCULATION |
-------------------- */

// TOTAL EXPENSES
export async function getTotalExpenses(userId) {
    const [rows] = await pool.query(`
        SELECT
        SUM (Amount) AS TotalExpense
        FROM expenses
        WHERE UserID = ? AND Category != 'Sold'
        `,[userId]);

        return rows;
}

// TOTAL INCOME ESTIMATION - FROM SOLD PIGS
export async function getEstimatedIncome(userId) {
    const [rows] = await pool.query(`
        SELECT
        SUM (Amount) AS EstimatedIncome
        FROM expenses        
        WHERE UserID = ? AND Category = 'Sold'
        `,[userId]);

        return rows;
}

// PROJECTED PROFIT - INCOME FROM SOLD PIGS MINUS EXPENSES
export async function getProjectedProfit(userId) {
    const [rows] = await pool.query(`
        SELECT
        SUM(CASE WHEN Category = 'Sold' THEN Amount ELSE 0 END) -
        SUM(CASE WHEN Category != 'Sold' THEN Amount ELSE 0 END) AS ProjectedProfit
        FROM expenses
        WHERE UserID = ?
        `,[userId]);
        return rows;
    }

/*---------------------
|  EXPENSE LOGIC     |
-------------------- */

// FEED EXPENSES - Get total feed expenses for a user
export async function getFeedExpenses(userId) {
    const [rows] = await pool.query(`
        SELECT
            SUM(Amount) AS TotalFeedExpenses
        FROM expenses
        WHERE UserID = ? AND Category = 'Feed'
    `, [userId]);
    return rows.length > 0 ? rows : [{ TotalFeedExpenses: null }];
}

// MEDICINE EXPENSES - Get total medicine expenses for a user
export async function getMedicineExpenses(userId) {
    const [rows] = await pool.query(`
        SELECT
            SUM(Amount) AS TotalMedicineExpenses
        FROM expenses
        WHERE UserID = ? AND Category = 'Medicine'
    `, [userId]);
    return rows.length > 0 ? rows : [{ TotalMedicineExpenses: null }];
}

// TRANSPORTATION EXPENSES - Get total transportation expenses for a user
export async function getTransportationExpenses(userId) {
    const [rows] = await pool.query(`
        SELECT
            SUM(Amount) AS TotalTransportationExpenses
        FROM expenses
        WHERE UserID = ? AND Category = 'Transportation'
    `, [userId]);
    return rows.length > 0 ? rows : [{ TotalTransportationExpenses: null }];
}

// PIGLETS EXPENSES - Get total piglets expenses for a user
export async function getPigletsExpenses(userId) {
    const [rows] = await pool.query(`
        SELECT
            SUM(Amount) AS TotalPigletsExpenses
        FROM expenses
        WHERE UserID = ? AND Category = 'Piglets'
    `, [userId]);
    return rows.length > 0 ? rows : [{ TotalPigletsExpenses: null }];
}

// LABOR EXPENSES - Get total labor expenses for a user
export async function getLaborExpenses(userId) {
    const [rows] = await pool.query(`
        SELECT
            SUM(Amount) AS TotalLaborExpenses
        FROM expenses
        WHERE UserID = ? AND Category = 'Labor'
    `, [userId]);
    return rows.length > 0 ? rows : [{ TotalLaborExpenses: null }];
}

// UTILITIES EXPENSES - Get total utilities expenses for a user
export async function getUtilitiesExpenses(userId) {
    const [rows] = await pool.query(`
        SELECT
        SUM(Amount) AS TotalUtilitiesExpenses
        FROM expenses
        WHERE UserID = ? AND Category = 'Utilities'
    `, [userId]);
    return rows.length > 0 ? rows : [{ TotalUtilitiesExpenses: null }];
}

/*---------------------
| DROPDOWN FILTERS    |
-------------------- */

// GET ALL FARMS FOR A USER (for dropdown)
export async function getFarmsForUser(userId) {
    const [rows] = await pool.query(`
        SELECT FarmID, FarmName
        FROM farm
        WHERE UserID = ?
        ORDER BY FarmName ASC
    `, [userId]);
    return rows;
}

// GET ALL PIGS FOR A USER (for dropdown)
export async function getPigsForUser(userId) {
    const [rows] = await pool.query(`
        SELECT DISTINCT p.PigID, p.PigName, f.FarmID, f.FarmName
        FROM pig p
        INNER JOIN farm f ON p.FarmID = f.FarmID
        WHERE f.UserID = ?
        ORDER BY f.FarmName ASC, p.PigName ASC
    `, [userId]);
    return rows;
}

// GET EXPENSE CATEGORIES (fixed list)
export function getExpenseCategories() {
    return [
        'Feed',
        'Medicine',
        'Vaccination',
        'Labor',
        'Transportation',
        'Piglets',
        'Utilities',
        'Sold',
        'Others'
    ];
}

/*---------------------
|  EXPENSE CRUD       |
-------------------- */

// ADD NEW EXPENSE
export async function addExpense(data) {
    const { UserID, PigID, FarmID, Date, Amount, Category } = data;
    
    const ExpID = await generateExpenseID();
    
    // If FarmID is not provided, attempt to derive it from the pig record
    let farmIdToUse = FarmID;
    if (!farmIdToUse && PigID) {
        const [pigRows] = await pool.query(`SELECT FarmID FROM pig WHERE PigID = ? LIMIT 1`, [PigID]);
        if (pigRows && pigRows.length > 0) farmIdToUse = pigRows[0].FarmID;
    }

    const [result] = await pool.query(`
        INSERT INTO expenses (ExpID, UserID, PigID, FarmID, Date, Amount, Category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [ExpID, UserID, PigID, farmIdToUse, Date, Amount, Category]);
    
    return { ...result, ExpID };
}

// ADD EXPENSE FOR PIGS (used by Farm UI where pig context is known)
export async function addExpenseforPigs(data) {
    const { PigID, Date, Amount, Category, UserID } = data;

    // PigID is required because the farm UI adds expense for a specific pig
    if (!PigID) {
        throw new Error('PigID is required to add an expense for a pig');
    }

    // Determine user if not provided by looking up the pig -> farm -> user
    let userId = UserID;
    if (!userId) {
        const [rows] = await pool.query(`
            SELECT f.UserID
            FROM pig p
            JOIN farm f ON p.FarmID = f.FarmID
            WHERE p.PigID = ?
            LIMIT 1
        `, [PigID]);

        if (!rows || rows.length === 0) {
            throw new Error('Unable to determine user for provided PigID');
        }

        userId = rows[0].UserID;
    }

    const ExpID = await generateExpenseID();

    // Determine FarmID for this pig so the expense can reference it
    const [pigRows] = await pool.query(`SELECT FarmID FROM pig WHERE PigID = ? LIMIT 1`, [PigID]);
    const farmId = (pigRows && pigRows.length > 0) ? pigRows[0].FarmID : null;

    const [result] = await pool.query(`
        INSERT INTO expenses (ExpID, UserID, PigID, FarmID, Date, Amount, Category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [ExpID, userId, PigID, farmId, Date, Amount, Category]);

    // If this expense marks the pig as sold, update pig status as well
    if (Category === 'Sold') {
        await pool.query(`
            UPDATE pig
            SET PigStatus = 'Sold'
            WHERE PigID = ? AND FarmID IN (
                SELECT FarmID FROM farm WHERE UserID = ?
            )
        `, [PigID, userId]);
    }

    return { ...result, ExpID };
}

// EDIT EXISTING EXPENSE
export async function editExpense(expenseId, data) {
    const { Date, Amount, Category } = data;
    
    const [result] = await pool.query(`
        UPDATE expenses
        SET Date = ?, Amount = ?, Category = ?
        WHERE ExpID = ?
    `, [Date, Amount, Category, expenseId]);
    
    return result;
}

// DELETE EXPENSE
export async function deleteExpense(expenseId, userId) {
    // Verify the expense belongs to the user before deleting
    const [rows] = await pool.query(`
        SELECT ExpID FROM expenses
        WHERE ExpID = ? AND UserID = ?
    `, [expenseId, userId]);
    
    if (rows.length === 0) {
        throw new Error('Expense not found or unauthorized');
    }
    
    const [result] = await pool.query(`
        DELETE FROM expenses
        WHERE ExpID = ?
    `, [expenseId]);
    
    return result;
}

// CANCEL SOLD PIG - Set status back to ToSale
export async function cancelSoldPig(expenseId, userId) {
    // Get the expense to find the PigID
    const [expenseRows] = await pool.query(`
        SELECT PigID FROM expenses
        WHERE ExpID = ? AND UserID = ? AND Category = 'Sold'
    `, [expenseId, userId]);
    
    if (expenseRows.length === 0) {
        throw new Error('Sold record not found or unauthorized');
    }
    
    const pigId = expenseRows[0].PigID;
    
    // Delete the sold expense record
    await pool.query(`
        DELETE FROM expenses
        WHERE ExpID = ?
    `, [expenseId]);
    
    // Update pig status from Sold back to ToSale
    const [updateResult] = await pool.query(`
        UPDATE pig
        SET PigStatus = 'ToSale'
        WHERE PigID = ? AND FarmID IN (
            SELECT FarmID FROM farm WHERE UserID = ?
        )
    `, [pigId, userId]);
    
    return updateResult;
}

/*---------------------
| FILTERED FUNCTIONS  |
-------------------- */

// HELPER FUNCTION: Build WHERE clause for filters
function buildFilterWhereClause(userId, filters) {
    let whereClause = 'WHERE f.UserID = ?';
    const params = [userId];

    if (filters.farm) {
        whereClause += ' AND f.FarmName = ?';
        params.push(filters.farm);
    }

    if (filters.pig) {
        whereClause += ' AND p.PigName = ?';
        params.push(filters.pig);
    }

    if (filters.month) {
        whereClause += ' AND MONTH(e.Date) = ?';
        params.push(filters.month);
    }

    if (filters.year) {
        whereClause += ' AND YEAR(e.Date) = ?';
        params.push(filters.year);
    }

    return { whereClause, params };
}

// FILTERED: Get user expenses with chart data (bar chart)
export async function getUserExpensesFiltered(userId, filters = {}) {
    const { whereClause, params } = buildFilterWhereClause(userId, filters);

    const query = `
        SELECT MONTH(e.Date) as month,
        SUM(CASE WHEN e.Category = 'Sold' THEN e.Amount ELSE 0 END) AS income,
        SUM(CASE WHEN e.Category != 'Sold' THEN e.Amount ELSE 0 END) AS expenses
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        ${whereClause}
        GROUP BY MONTH(e.Date)
        ORDER BY month
    `;

    const [rows] = await pool.query(query, params);

    const result = [];
    for (let m = 1; m <= 12; m++) {
        const row = rows.find(r => r.month === m);
        result.push({
            month: m,
            income: row?.income || 0,
            expenses: row?.expenses || 0
        });
    }
    return result;
}

// FILTERED: Get total expenses
export async function getTotalExpensesFiltered(userId, filters = {}) {
    const { whereClause, params } = buildFilterWhereClause(userId, filters);

    const query = `
        SELECT SUM(e.Amount) AS TotalExpense
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        ${whereClause} AND e.Category != 'Sold'
    `;

    const [rows] = await pool.query(query, params);
    return rows;
}

// FILTERED: Get estimated income
export async function getEstimatedIncomeFiltered(userId, filters = {}) {
    const { whereClause, params } = buildFilterWhereClause(userId, filters);

    const query = `
        SELECT SUM(e.Amount) AS EstimatedIncome
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        ${whereClause} AND e.Category = 'Sold'
    `;

    const [rows] = await pool.query(query, params);
    return rows;
}

// FILTERED: Get projected profit
export async function getProjectedProfitFiltered(userId, filters = {}) {
    const { whereClause, params } = buildFilterWhereClause(userId, filters);

    const query = `
        SELECT
        SUM(CASE WHEN e.Category = 'Sold' THEN e.Amount ELSE 0 END) -
        SUM(CASE WHEN e.Category != 'Sold' THEN e.Amount ELSE 0 END) AS ProjectedProfit
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        ${whereClause}
    `;

    const [rows] = await pool.query(query, params);
    return rows;
}

// FILTERED: Feed Expenses
export async function getFeedExpensesFiltered(userId, filters = {}) {
    const { whereClause, params } = buildFilterWhereClause(userId, filters);

    const query = `
        SELECT SUM(e.Amount) AS TotalFeedExpenses
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        ${whereClause} AND e.Category = 'Feed'
    `;

    const [rows] = await pool.query(query, params);
    return rows.length > 0 ? rows : [{ TotalFeedExpenses: null }];
}

// FILTERED: Medicine Expenses
export async function getMedicineExpensesFiltered(userId, filters = {}) {
    const { whereClause, params } = buildFilterWhereClause(userId, filters);

    const query = `
        SELECT SUM(e.Amount) AS TotalMedicineExpenses
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        ${whereClause} AND e.Category = 'Medicine'
    `;

    const [rows] = await pool.query(query, params);
    return rows.length > 0 ? rows : [{ TotalMedicineExpenses: null }];
}

// FILTERED: Transportation Expenses
export async function getTransportationExpensesFiltered(userId, filters = {}) {
    const { whereClause, params } = buildFilterWhereClause(userId, filters);

    const query = `
        SELECT SUM(e.Amount) AS TotalTransportationExpenses
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        ${whereClause} AND e.Category = 'Transportation'
    `;

    const [rows] = await pool.query(query, params);
    return rows.length > 0 ? rows : [{ TotalTransportationExpenses: null }];
}

// FILTERED: Piglets Expenses
export async function getPigletsExpensesFiltered(userId, filters = {}) {
    const { whereClause, params } = buildFilterWhereClause(userId, filters);

    const query = `
        SELECT SUM(e.Amount) AS TotalPigletsExpenses
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        ${whereClause} AND e.Category = 'Piglets'
    `;

    const [rows] = await pool.query(query, params);
    return rows.length > 0 ? rows : [{ TotalPigletsExpenses: null }];
}

// FILTERED: Labor Expenses
export async function getLaborExpensesFiltered(userId, filters = {}) {
    const { whereClause, params } = buildFilterWhereClause(userId, filters);

    const query = `
        SELECT SUM(e.Amount) AS TotalLaborExpenses
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        ${whereClause} AND e.Category = 'Labor'
    `;

    const [rows] = await pool.query(query, params);
    return rows.length > 0 ? rows : [{ TotalLaborExpenses: null }];
}

// FILTERED: Utilities Expenses
export async function getUtilitiesExpensesFiltered(userId, filters = {}) {
    const { whereClause, params } = buildFilterWhereClause(userId, filters);

    const query = `
        SELECT SUM(e.Amount) AS TotalUtilitiesExpenses
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        ${whereClause} AND e.Category = 'Utilities'
    `;

    const [rows] = await pool.query(query, params);
    return rows.length > 0 ? rows : [{ TotalUtilitiesExpenses: null }];
}

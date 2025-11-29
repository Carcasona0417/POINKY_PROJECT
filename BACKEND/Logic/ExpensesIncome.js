import { pool } from "../Database/db.js";

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
            DATE_FORMAT(e.Date, '%Y-%m-%d') AS date,
            f.FarmName AS farm,
            p.PigName AS pig,
            e.Category AS category,
            e.Amount AS price
        FROM expenses e
        INNER JOIN pig p ON e.PigID = p.PigID
        INNER JOIN farm f ON p.FarmID = f.FarmID
        WHERE e.UserID = ? AND e.Category != 'Sold'
        ORDER BY e.Date DESC
    `, [userId]);

    return rows;
}

export async function getSoldTable(userId) {
    const [rows] = await pool.query(`
        SELECT
        DATE_FORMAT(e.Date, '%Y-%m-%d') AS dateSold,
        f.FarmName AS farm,
        p.PigName AS pig,
        w.Weight AS weight,
        e.Category AS category,
        e.Amount AS pricePerKg,
        W.Weight * e.Amount AS totalPrice
        FROM expenses e
        JOIN pig p ON e.PigID = p.PigID
        JOIN farm f ON p.FarmID = f.FarmID
        JOIN weight_records w ON w.PigID = p.PigID
        WHERE w.Date = (SELECT MAX(Date) FROM weight_records WHERE PigID = p.PigID)
        AND e.UserID = ?
        `, [userId]);

        return rows;
}
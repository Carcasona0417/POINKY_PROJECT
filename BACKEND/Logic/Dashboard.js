import { pool } from "../Database/db.js";

// function for dashboard to count total farms
export async function getTotalFarms(userId) {
    const [rows] = await pool.query(
        'SELECT COUNT(*) AS totalFarms FROM farm WHERE UserID = ?', 
        [userId]
    );
    return rows;
}

// function for dashboard to count total pigs
export async function getTotalPigs(userId) {
    const [rows] = await pool.query(
        `SELECT COUNT(*) AS totalPigs
         FROM pig p
         JOIN farm f ON p.farmID = f.farmID
         WHERE f.UserID = ?`, [userId]
    );
    return rows;
}

// function for dashboard to count expenses for this month
export async function getMonthExpenses(userId) {
    const [rows] = await pool.query(
        `SELECT SUM(e.Amount) AS monthExpenses
         FROM expenses e
         JOIN pig p ON e.PigID = p.PigID
         JOIN farm f ON p.FarmID = f.FarmID
         WHERE f.UserID = ? AND Category != 'Sold'
         AND MONTH(e.Date) = MONTH(CURRENT_DATE())
         AND YEAR(e.Date) = YEAR(CURRENT_DATE())`,
        [userId]
    );
    return rows;
}


// function for dashboard to count for upmcoming reminders
export async function getUpcomingReminders(userId) {
    const [rows] = await pool.query(`SELECT COUNT(*) AS upcomingReminders 
        FROM reminders 
        WHERE UserID = ?
        AND Date >= CURRENT_DATE() 
        AND Date < DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)`,
        [userId]
    );
    return rows;
}


// function for Monthly Expenses for bar chart
export async function getChartData(userId) {

    const [rows] = await pool.query(`
        SELECT 
            MONTH(e.Date) AS month,
            SUM(CASE WHEN e.Category = 'Sold' THEN e.Amount * w.Weight ELSE 0 END) AS income,
            SUM(CASE WHEN e.Category != 'Sold' THEN e.Amount ELSE 0 END) AS farm_expenses
        FROM expenses e
        LEFT JOIN (
            SELECT wr.PigID, wr.Weight
            FROM weight_records wr
            INNER JOIN (
                SELECT PigID, MAX(Date) AS LatestDate
                FROM weight_records
                GROUP BY PigID
            ) lw ON lw.PigID = wr.PigID AND lw.LatestDate = wr.Date
        ) w ON w.PigID = e.PigID
        WHERE UserID = ?
        GROUP BY MONTH(Date)
        ORDER BY month
    `, [userId]);

    // Merge into 12 months
    const result = [];
    for (let m = 1; m <= 12; m++) {
        const row = rows.find(r => r.month === m);
        result.push({
            month: m,
            income: row?.income || 0,
            farm_expenses: row?.farm_expenses || 0
        });
    }

    return result;
}

// FUNCTION FOR PIE CHART --- BREAKDOWN OF ALL THE EXPENSES
export async function getPieChart(userId) {

    const[rows] = await pool.query(`
        
        SELECT 
            SUM(CASE WHEN Category = 'Feed' THEN Amount ELSE 0 END) AS feed,
            SUM(CASE WHEN Category = 'Piglets' THEN Amount ELSE 0 END) AS piglets,
            SUM(CASE WHEN Category = 'Medicines' OR Category = 'Vaccination' THEN Amount ELSE 0 END) AS medical,
            SUM(CASE WHEN Category = 'Utilities' THEN Amount ELSE 0 END) AS utilities,
            SUM(CASE WHEN Category = 'Labor' THEN Amount ELSE 0 END) AS labor,
            SUM(CASE WHEN Category = 'Maintenance' THEN Amount ELSE 0 END) AS maintenance
        FROM expenses
        WHERE UserID = ?`, [userId]
    );

    return rows[0];
    
}
import mysql from 'mysql2';

import dotenv from 'dotenv';
dotenv.config({ path: './BACKEND/.env' });


const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

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
         WHERE f.UserID = ?
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

    const [income_rows] = await pool.query(`
        SELECT MONTH(Date) AS month, SUM(Amount) AS total_income
        FROM expenses
        WHERE UserID = ?
        AND Category = 'Sold'
        GROUP BY MONTH(Date)`,
        [userId]
);

    // breakdown farm expeses
    const [farm_expense_rows] = await pool.query(`
        SELECT MONTH(Date) AS month, SUM(Amount) AS farm_expenses
        FROM expenses
        WHERE UserID = ?
        AND Category != 'Sold' 
        AND Category != 'Feed'
        GROUP BY MONTH(Date)`,
        [userId]
    );
    
    const [feed_expense_rows] = await pool.query(`
        SELECT MONTH(Date) AS month, SUM(Amount) AS feed_expenses
        FROM expenses
        WHERE UserID = ?
        AND Category = 'feed'
        GROUP BY MONTH(Date)`
        [userId]
    );

    // merge into one array of 12 months
    const result = [];
    for (let m = 1; m <= 12; m++) {
        result.push({
            month: m,
            income: (income_rows.find(r => r.month === m)?.total_income) || 0,
            farm_expenses: (farm_expense_rows.find(r => r.month === m)?.farm_expenses) || 0,
            feed_expenses: (feed_expense_rows.find(r => r.month === m)?.feed_expenses) || 0
        });
    }

    return result;
}
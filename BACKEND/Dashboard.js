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
export async function getTotalFarms() {
    const [rows] = await pool.query('SELECT COUNT(*) AS totalFarms FROM farm');
    return rows;
}

// function for dashboard to count total pigs
export async function getTotalPigs() {
    const [rows] = await pool.query('SELECT COUNT(*) AS totalPigs FROM pig');
    return rows;
}

// function for dashboard to count expenses for this month
export async function getMonthExpenses() {
    const [rows] = await pool.query(`SELECT SUM(Amount) AS monthExpenses 
        FROM expenses 
        WHERE MONTH(Date) = MONTH(CURRENT_DATE()) 
        AND YEAR(Date) = YEAR(CURRENT_DATE())`);
    return rows;
}

// function for dashboard to count for upmcoming reminders
export async function getUpcomingReminders() {
    const [rows] = await pool.query(`SELECT COUNT(*) AS upcomingReminders 
        FROM reminders 
        WHERE Date >= CURRENT_DATE() 
        AND Date < DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)`);
    return rows;
}

// function for Monthly Expenses for bar chart
export async function getChartData() {
    const [income_rows] = await pool.query(`
        SELECT MONTH(Date) AS month, SUM(Amount) AS total_income
        FROM expenses
        WHERE Category = 'Sold'
        GROUP BY MONTH(Date)
    `);

    const [farm_expense_rows] = await pool.query(`
        SELECT MONTH(Date) AS month, SUM(Amount) AS farm_expenses
        FROM expenses
        WHERE Category != 'Sold' AND Category != 'Feed'
        GROUP BY MONTH(Date)
    `);

    const [feed_expense_rows] = await pool.query(`
        SELECT MONTH(Date) AS month, SUM(Amount) AS feed_expenses
        FROM expenses
        WHERE Category = 'Feed'
        GROUP BY MONTH(Date)
    `);

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
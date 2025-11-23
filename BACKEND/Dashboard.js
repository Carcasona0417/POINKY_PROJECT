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
export async function getMonthlyExpenses() {
    const [rows] = await pool.query(`
        SELECT MONTH(Date) AS month, SUM(Amount) AS total 
        FROM expenses 
        WHERE YEAR(Date) = YEAR(CURRENT_DATE())
        GROUP BY MONTH(Date)
        ORDER BY MONTH(Date)
    `);
        const monthlyExpenses = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0 }));

        rows.forEach(row => {
            monthlyExpenses[row.month - 1].total = row.total;
        });
        
    return monthlyExpenses;

}
import mysql from 'mysql2';

import dotenv from 'dotenv';
dotenv.config({ path: './BACKEND/.env' });


const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();

// Function for Register user and have an auto incremented UserID
export async function createUser(userID, username, email, password) {
    const [rows] = await pool.query(
        "SELECT UserID FROM user ORDER BY UserID DESC LIMIT 1"
    );

    let newID;
    if (rows.length > 0) {
        const lastID = rows[0].UserID;
        const number = parseInt(String(lastID).substring(1)) + 1;
        newID = 'U' + String(number).padStart(3, '0');
    } else {
        newID = 'U001';
    }

    const finalUserID = userID || newID;

    const [result] = await pool.query(`
        INSERT INTO user (UserID, Username, Email, Password) 
        VALUES (?, ?, ?, ?)`,
        [finalUserID, username, email, password]);

    return result;
}

export async function getUserByCredentials(email) {

    const [rows] = await pool.query('SELECT * FROM user WHERE Email = ?', [email]);
    return rows;
}
// OTP Send Email function

// function for password reset using OTP
export async function updateUserPassword(email, newPassword) {
    const [result] = await pool.query(`
        UPDATE user 
        SET Password = ? 
        WHERE Email = ?`,
        [newPassword, email]);
    return result;
}

import nodemailer from 'nodemailer';
import { pool } from "../Database/db.js";


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
// function for login
export async function getUserByCredentials(email) {

    const [rows] = await pool.query('SELECT * FROM user WHERE Email = ?', [email]);
    return rows;
}

// Get user by UserID including password (for verification)
export async function getUserByIdWithPassword(userId) {
    const [rows] = await pool.query('SELECT UserID, Username, Email, Password FROM user WHERE UserID = ?', [userId]);
    return rows && rows.length > 0 ? rows[0] : null;
}

// OTP Send Email function

export async function SendOTPEmail(email){

    const [rows] = await pool.query('SELECT * FROM user WHERE Email = ?', [email]);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "poinkycompany@gmail.com",
        pass: "ipgd oset rnup ijji"
      }
    });
    
    const otp = Math.floor(100000 + Math.random() * 900000);

   await transporter.sendMail({
    from: '"Poinky Farm Management" <no-reply@poinky.com>', // sender address
    to: email,    
    subject: "Your One-Time Password (OTP) Notification",
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #ff6b81;">Poinky Farm Management</h2>
            <p>Dear User,</p>
            <p>You have requested a one-time password (OTP) for your account. Please use the OTP below to complete your action. This OTP is valid for <b>10 minutes</b>.</p>
            
            <p style="text-align: center; font-size: 1.5em; font-weight: bold; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
                ${otp}
            </p>

            <p>If you did not request this, please ignore this email.</p>

            <p>Thank you,<br>
            <em>Poinky Farm Management Team</em></p>

            <hr style="border: none; border-top: 1px solid #eee;">
            <p style="font-size: 0.8em; color: #999;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `
});

    return otp;

} 


// function for password reset using OTP
export async function updateUserPassword(email, newPassword) {
    const [result] = await pool.query(`
        UPDATE user 
        SET Password = ? 
        WHERE Email = ?`,
        [newPassword, email]);
    return result;
}

// Update password by UserID
export async function updateUserPasswordById(userId, newPassword) {
    const [result] = await pool.query(`
        UPDATE user
        SET Password = ?
        WHERE UserID = ?
    `, [newPassword, userId]);
    return result;
}

// Update user's username and email by UserID
export async function updateUserProfile(userId, username, email) {
    if (!userId) throw new Error('UserID is required');
    if (!username) throw new Error('Username is required');
    if (!email) throw new Error('Email is required');

    // Ensure email is not used by another user
    const [existing] = await pool.query('SELECT UserID FROM user WHERE Email = ? AND UserID != ?', [email, userId]);
    if (existing && existing.length > 0) {
        throw new Error('Email already in use by another account');
    }

    const [result] = await pool.query(`
        UPDATE user
        SET Username = ?, Email = ?
        WHERE UserID = ?
    `, [username, email, userId]);

    return result;
}

// Get user by UserID
export async function getUserById(userId) {
    if (!userId) throw new Error('UserID is required');
    const [rows] = await pool.query('SELECT UserID, Username, Email FROM user WHERE UserID = ?', [userId]);
    return rows && rows.length > 0 ? rows[0] : null;
}

import { pool } from '../Database/db.js';

// generate unique ReminderID
async function generateReminderID() {
    const [rows] = await pool.query(`
        SELECT RemID
        FROM reminders
        ORDER BY RemID DESC
        LIMIT 1
    `);
    if (!rows || rows.length === 0) return 'R001';

    const lastID = rows[0].RemID;
    const number = parseInt(lastID.substring(1)) + 1;
    return 'R' + number.toString().padStart(3, '0');
}

// Displaying reminders for a specific user
export async function getUserReminders(userId) {
    const [rows] = await pool.query(`
        SELECT
            COALESCE(r.RemID, '') AS ReminderID,
            r.PigID AS PigID,
            r.FarmID AS FarmID,
            r.Task AS Title,
            r.Notes AS Description,
            DATE_FORMAT(r.Date, '%Y-%m-%d' ) AS Date,
            p.PigName AS PigName,
            f.FarmName AS FarmName
        FROM reminders r
        LEFT JOIN pig p ON r.PigID = p.PigID
        LEFT JOIN farm f ON p.FarmID = f.FarmID
        WHERE r.UserID = ?
        ORDER BY r.Date ASC
    `, [userId]);
        
    const today = new Date();

    rows.forEach(r => {
        const remDate = new Date(r.Date);
        const diff = Math.ceil((remDate - today) / (1000 * 60 * 60 * 24));
        r.IsThreeDaysLeft = (diff === 3);
        r.IsDueToday = (diff === 0);
    });

    return rows;
}

// Adding a new reminder
export async function addReminder(data) {
    // Accept multiple possible key names from front-end
    const userId = data.userId || data.UserID || data.user || null;
    const pigId  = data.pigId  || data.PigID  || data.pig  || null;
    const farmId = data.farmId || data.FarmID || data.farm || null;
    const date   = data.date   || data.Date   || null;
    const task   = data.task   || data.Task   || data.title || data.Title || null;
    const notes  = data.notes  || data.Notes  || data.description || data.Description || null;

    if (!userId) throw new Error('UserID is required to create a reminder');
    if (!date) throw new Error('Date is required to create a reminder');
    if (!task) throw new Error('Task/Title is required to create a reminder');

    const remID = await generateReminderID();

    // Insert using columns that the DB expects. If some columns don't exist in the DB, the query will throw and the caller should handle it.
    const sql = `
        INSERT INTO reminders (RemID, UserID, PigID, FarmID, Date, Task, Notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [remID, userId, pigId, farmId, date, task, notes];

    const [result] = await pool.query(sql, params);

    return { RemID: remID, affectedRows: result.affectedRows, insertId: result.insertId };
}

// Edit reminder 
export async function updateReminder(remID, data) {
    const userId = data.userId || data.UserID || data.user || null;
    const pigId  = data.pigId  || data.PigID  || data.pig  || null;
    const farmId = data.farmId || data.FarmID || data.farm || null;
    const date   = data.date   || data.Date   || null;
    const task   = data.task   || data.Task   || data.title || data.Title || null;
    const notes  = data.notes  || data.Notes  || data.description || data.Description || null;
    if (!remID) throw new Error('RemID is required to update a reminder');

    const sql = `
        UPDATE reminders
        SET UserID = ?, PigID = ?, FarmID = ?, Date = ?, Task = ?, Notes = ?
        WHERE RemID = ?
    `;
    const params = [userId, pigId, farmId, date, task, notes, remID];
    const [result] = await pool.query(sql, params);
    return { affectedRows: result.affectedRows };


}
// Delete reminder
export async function deleteReminder(remID) {
    if (!remID) throw new Error('RemID is required to delete a reminder');
    const sql = `DELETE FROM reminders WHERE RemID = ?`;
    const [result] = await pool.query(sql, [remID]);
    return { affectedRows: result.affectedRows };
}

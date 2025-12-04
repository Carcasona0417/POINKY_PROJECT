import { pool } from '../Database/db.js';
import { addReminder } from './Reminders.js'; 

export async function addVaccination(data) {
    // Accept multiple possible key names from callers
    const PigID   = data.PigID || data.pigId || data.pig || null;
    const DueDate = data.DueDate || data.dueDate || null;
    // Administered date (user-entered Date field)
    const VaccDate = data.Date || data.date || data.vaccDate || data.vaccinationDate || null;
    const Category= data.Category || data.category || data.Task || data.task || null;
    const UserID  = data.UserID || data.userId || data.user || null;
    const FarmID  = data.FarmID || data.farmId || data.farm || null;

    // Build reminder payload and create the reminder first so we have a RemID
    const reminderData = {
        userId: UserID,   // required by addReminder
        pigId: PigID,
        farmId: FarmID,
        date: DueDate,    // vaccination due date
        task: Category,   // vaccination category
        notes: Category
    };

    // create reminder (this will throw if required fields are missing)
    const reminder = await addReminder(reminderData);

    const RemID = reminder && (reminder.RemID || reminder.remID) ? (reminder.RemID || reminder.remID) : null;

    // Insert vaccination record referencing the new RemID
    const [result] = await pool.query(
        `INSERT INTO Vaccination_Record (PigID, RemID, Date, DueDate, Category)
         VALUES (?, ?, ?, ?, ?)`,
        [PigID, RemID, VaccDate, DueDate, Category]
    );

    return {
        vaccinationResult: result,
        reminderResult: reminder
    };
}

export async function getVaccinations(filters = {}) {
    const PigID    = filters.PigID || filters.pigId || filters.pig || null;
    const Category = filters.Category || filters.category || null;
    const FromDate = filters.FromDate || filters.fromDate || null;
    const ToDate   = filters.ToDate || filters.toDate || null;

    // Return formatted Date and DueDate as YYYY-MM-DD so frontend can display directly
    let sql = `SELECT Vaccination_Record.*, DATE_FORMAT(Date, '%Y-%m-%d') AS Date, DATE_FORMAT(DueDate, '%Y-%m-%d') AS DueDate
               FROM Vaccination_Record WHERE 1=1`;
    const params = [];

    if (PigID) {
        sql += ` AND PigID = ?`;
        params.push(PigID);
    }
    if (Category) {
        sql += ` AND Category = ?`;
        params.push(Category);
    }
    if (FromDate) {
        sql += ` AND DueDate >= ?`;
        params.push(FromDate);
    }
    if (ToDate) {
        sql += ` AND DueDate <= ?`;
        params.push(ToDate);
    }

    const [rows] = await pool.query(sql, params);
    return rows; // this can be sent to the frontend
}

// -------------------- UPDATE VACCINATION --------------------
export async function updateVaccination(data) {
    const { VaccinationID, PigID, Date, DueDate, Category } = data;

    // If you don’t have a PK, use conditions that identify the record uniquely
    if (!PigID || !Date) throw new Error('PigID and Date are required to update vaccination');

    const [result] = await pool.query(
        `UPDATE Vaccination_Record
         SET DueDate = ?, Category = ?
         WHERE PigID = ? AND Date = ?`,
        [DueDate, Category, PigID, Date]
    );

    return { affectedRows: result.affectedRows };
}

// -------------------- DELETE VACCINATION --------------------
export async function deleteVaccination(data) {
    const PigID = data.PigID || data.pigId || data.pig || null;
    const Date  = data.Date || data.date || null;

    if (!PigID || !Date) throw new Error('PigID and Date are required to delete vaccination');

    const [result] = await pool.query(
        `DELETE FROM Vaccination_Record WHERE PigID = ? AND Date = ?`,
        [PigID, Date]
    );

    return { affectedRows: result.affectedRows };
}
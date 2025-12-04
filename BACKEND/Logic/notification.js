import {pool} from '../Database/db.js';

// Get notification from reminders table

export async function getNotifications(userId) {
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

    const now = new Date();

    rows.forEach(r => {
        const remDate = new Date(r.Date);

        const diffDays = Math.ceil((remDate - now) / (1000 * 60 * 60 * 24));

        const diffMs = remDate - now;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

        r.DaysLeft = diffDays;
        r.IsToday = diffDays === 0;
        r.IsThreeDaysLeft = diffDays >= 0 && diffDays <= 3;

        r.TimeLeft = r.IsToday ? `${diffHours}h ${diffMinutes}m` : null;
    });

    return rows.filter(r => r.IsThreeDaysLeft);
}

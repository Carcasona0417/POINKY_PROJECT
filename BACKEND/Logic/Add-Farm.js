import { pool } from "../Database/db.js";

async function generateFarmID() {
    const [rows] = await pool.query(`
        SELECT FarmID 
        FROM farm 
        ORDER BY FarmID DESC 
        LIMIT 1
    `);

    if (rows.length === 0) return "F001";

    const lastID = rows[0].FarmID; // e.g. F005
    const number = parseInt(lastID.substring(1)) + 1;

    return "F" + number.toString().padStart(3, "0");
}

export async function addFarm(data) {
    const { FarmName, UserID } = data;

    const FarmID = await generateFarmID();

    const [result] = await pool.query(
        `INSERT INTO farm (FarmID, FarmName, UserID)
         VALUES (?, ?, ?)`,
        [FarmID, FarmName, UserID]
    );

    return { result, FarmID };
}

// ADD delete and edit
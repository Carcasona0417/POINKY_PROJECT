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

// GET ALL FARMS FOR A USER
export async function getUserFarms(userId) {
    const [rows] = await pool.query(`
        SELECT FarmID, FarmName 
        FROM farm 
        WHERE UserID = ?
        ORDER BY FarmName ASC
    `, [userId]);
    return rows;
}

// ADD delete and edit

export async function renameFarm(FarmID, FarmName) {
    const [result] = await pool.query(
        `UPDATE farm SET FarmName = ? WHERE FarmID = ?`,
        [FarmName, FarmID]
    );
    return result;
}

export async function deleteFarm(FarmID) {
    const [result] = await pool.query(
        `DELETE FROM farm WHERE FarmID = ?`,
        [FarmID]
    );
    return result;
}
import { pool } from "../Database/db.js";

export async function addPig(data) {

    const{ PigID, PigName, Breed, Gender, Date, Age, Weight, PigType, PigStatus, FarmID } = data;

    const [result] = await pool.query(`

        INSERT INTO pig(
        PigID,
        PigName,
        Breed,
        Gender,
        Date,
        Age,
        Weight,
        PigType,
        PigStatus,
        FarmID
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
    [PigID, PigName, Breed, Gender, Date, Age, Weight, PigType, PigStatus, FarmID]);

    return result;
}

// TO DISPLAY THE PIGS BASED ON THE FARM
export async function getPigs(farmId){
    const [rows] = await pool.query (`
        SELECT * FROM pig WHERE FarmID = ?
        `, [farmId]);
        return rows;
    }

// GET ALL PIGS FOR A USER (across all farms)
export async function getUserPigs(userId) {
    const [rows] = await pool.query(`
        SELECT p.PigID, p.PigName, f.FarmID, f.FarmName
        FROM pig p
        INNER JOIN farm f ON p.FarmID = f.FarmID
        WHERE f.UserID = ?
        ORDER BY p.PigName ASC
    `, [userId]);
    return rows;
}

// GET PIGS FOR A SPECIFIC FARM
export async function getPigsByFarm(farmId) {
    const [rows] = await pool.query(`
        SELECT PigID, PigName 
        FROM pig 
        WHERE FarmID = ?
        ORDER BY PigName ASC
    `, [farmId]);
    return rows;
}

// ADD delete and edit
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
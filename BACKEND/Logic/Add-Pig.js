import { pool } from "../Database/db.js";
import { addWeightRecord, getWeightHistory, getCurrentWeight, getInitialWeight } from "./Weight-Records.js";

export async function addPig(data) {

    // Avoid shadowing the global `Date` constructor by renaming the incoming field
    const{ PigID, PigName, Breed, Gender, Date: AcquiredDate, Age, Weight, PigType, PigStatus, FarmID } = data;

    // Generate PigID if not provided
    let finalPigID = PigID;
    if (!finalPigID) {
        const [rows] = await pool.query(`
            SELECT PigID FROM pig ORDER BY PigID DESC LIMIT 1
        `);
        if (!rows || rows.length === 0) {
            finalPigID = 'P001';
        } else {
            const last = rows[0].PigID; // e.g. P005
            const num = parseInt(last.replace(/^P/, '')) + 1;
            finalPigID = 'P' + num.toString().padStart(3, '0');
        }
    }

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
    [finalPigID, PigName, Breed, Gender, AcquiredDate, Age, Weight, PigType, PigStatus, FarmID]);

    // If an initial Weight was provided, also insert an initial weight record
    let insertedWeightRecord = null;
    try {
        if (Weight !== undefined && Weight !== null && Weight !== '') {
            // Use the provided acquired date for the initial weight if available,
            // otherwise use today's date. `AcquiredDate` may be a string or Date-like.
            let weightDate;
            try {
                if (AcquiredDate) {
                    weightDate = (new Date(AcquiredDate)).toISOString().slice(0,10);
                } else {
                    weightDate = (new Date()).toISOString().slice(0,10);
                }
            } catch (e) {
                // Fallback to today if parsing fails
                weightDate = (new Date()).toISOString().slice(0,10);
            }

            insertedWeightRecord = await addWeightRecord(finalPigID, Weight, weightDate);
        }
    } catch (err) {
        console.warn('Failed to insert initial weight record for pig', finalPigID, err);
    }

    return { result, PigID: finalPigID, insertedWeightRecord };
}

// TO DISPLAY THE PIGS BASED ON THE FARM
export async function getPigs(farmId){
    const [rows] = await pool.query (`
        SELECT * FROM pig WHERE FarmID = ?
        `, [farmId]);

    // Attach initial weight to each pig
    // Weight in pig table is initial and never changes
    const pigs = [];
    for (const p of rows) {
        const pig = { ...p };
        // Set initialWeight directly from pig table
        if (pig.Weight !== undefined && pig.Weight !== null && pig.Weight !== '') {
            pig.initialWeight = `${parseFloat(pig.Weight)}kg`;
        } else {
            pig.initialWeight = '0kg';
        }

        // Attach expenses for this pig (so frontend can display them)
        try {
                const [expRows] = await pool.query(`
                    SELECT
                        ExpID,
                        DATE_FORMAT(Date, '%Y-%m-%d') AS date,
                        Amount AS price,
                        Category AS category
                    FROM expenses
                    WHERE PigID = ?
                    ORDER BY Date DESC
                `, [pig.PigID]);
                pig.expenses = Array.isArray(expRows) ? expRows : [];
        } catch (e) {
            pig.expenses = [];
        }

        pigs.push(pig);
    }

    return pigs;
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

export async function renamePig(PigID, PigName) {
    const [result] = await pool.query(
        `UPDATE pig SET PigName = ? WHERE PigID = ?`,
        [PigName, PigID]
    );
    return result;
}

// Update pig details
export async function updatePig(PigID, updates) {
    try {
        const { PigName, Breed, Gender, Age, Date: DateAcquired, Weight, PigType, PigStatus } = updates;
        
        // Build dynamic update query based on provided fields
        const updateFields = [];
        const updateValues = [];

        if (PigName !== undefined && PigName !== null) {
            updateFields.push('PigName = ?');
            updateValues.push(PigName);
        }
        if (Breed !== undefined && Breed !== null) {
            updateFields.push('Breed = ?');
            updateValues.push(Breed);
        }
        if (Gender !== undefined && Gender !== null) {
            updateFields.push('Gender = ?');
            updateValues.push(Gender);
        }
        if (Age !== undefined && Age !== null) {
            updateFields.push('Age = ?');
            updateValues.push(Age);
        }
        if (DateAcquired !== undefined && DateAcquired !== null) {
            updateFields.push('Date = ?');
            updateValues.push(DateAcquired);
        }
        if (Weight !== undefined && Weight !== null) {
            updateFields.push('Weight = ?');
            updateValues.push(Weight);
        }
        if (PigType !== undefined && PigType !== null) {
            updateFields.push('PigType = ?');
            updateValues.push(PigType);
        }
        if (PigStatus !== undefined && PigStatus !== null) {
            updateFields.push('PigStatus = ?');
            updateValues.push(PigStatus);
        }

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        updateValues.push(PigID);

        const query = `UPDATE pig SET ${updateFields.join(', ')} WHERE PigID = ?`;
        const [result] = await pool.query(query, updateValues);

        if (result.affectedRows === 0) {
            throw new Error('Pig not found');
        }

        // Return the updated pig
        const [rows] = await pool.query('SELECT * FROM pig WHERE PigID = ?', [PigID]);
        if (rows.length === 0) {
            throw new Error('Pig not found');
        }

        return rows[0];
    } catch (err) {
        throw err;
    }
}

export async function deletePig(PigID) {
    try {
        // First check if pig exists
        const [rows] = await pool.query('SELECT * FROM pig WHERE PigID = ?', [PigID]);
        if (rows.length === 0) {
            throw new Error('Pig not found');
        }

        // Delete all weight records first (due to foreign key constraint)
        await pool.query('DELETE FROM weight_records WHERE PigID = ?', [PigID]);

        // Then delete the pig
        const [result] = await pool.query('DELETE FROM pig WHERE PigID = ?', [PigID]);

        return { success: true, message: 'Pig and its records deleted successfully' };
    } catch (err) {
        throw err;
    }
}

// Provide pig weight history + initial weight for controllers
export async function getPigWeightHistory(pigId) {
    // weight history from weight_records table (may be empty)
    const history = await getWeightHistory(pigId);

    // initial weight stored on pig table (may be null)
    const initial = await getInitialWeight(pigId);

    const initialWeight = (initial !== null && initial !== undefined) ? parseFloat(initial) : null;

    // current weight is the latest record, or fall back to initial weight
    let currentWeight = null;
    if (history && history.length > 0) {
        currentWeight = history[history.length - 1].weight;
    } else if (initialWeight !== null) {
        currentWeight = initialWeight;
    }

    return { initialWeight, currentWeight, weightHistory: history };
}



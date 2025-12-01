import { pool } from "../Database/db.js";

export async function addPig(data) {

    const{ PigID, PigName, Breed, Gender, Date, Age, Weight, PigType, PigStatus, FarmID } = data;

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
    [finalPigID, PigName, Breed, Gender, Date, Age, Weight, PigType, PigStatus, FarmID]);

    // If an initial Weight was provided, also insert an initial weight record
    let insertedWeightRecord = null;
    try {
        if (Weight !== undefined && Weight !== null && Weight !== '') {
            // Use the pig's Date (acquired date) as the weight record date if available, otherwise use today's date
            const weightDate = Date ? (new Date(Date)).toISOString().slice(0,10) : (new Date()).toISOString().slice(0,10);
            const weightId = 'W' + Date.now() + Math.random().toString(36).slice(2,6).toUpperCase();
            await pool.query(`
                INSERT INTO weight_records (WeightID, Date, Weight, PigID, PhotoPath)
                VALUES (?, ?, ?, ?, ?)
            `, [weightId, weightDate, Weight, finalPigID, null]);

            insertedWeightRecord = {
                WeightID: weightId,
                Date: weightDate,
                Weight: parseFloat(Weight),
                PigID: finalPigID,
                PhotoPath: null
            };
        }
    } catch (err) {
        // Log but don't fail pig creation if weight record insert fails
        console.warn('Failed to insert initial weight record for pig', finalPigID, err);
    }

    return { result, PigID: finalPigID, insertedWeightRecord };
}

// TO DISPLAY THE PIGS BASED ON THE FARM
export async function getPigs(farmId){
    const [rows] = await pool.query (`
        SELECT * FROM pig WHERE FarmID = ?
        `, [farmId]);

    // Attach weight records (weightHistory) and current display weight to each pig
    const pigs = [];
    for (const p of rows) {
        const pig = { ...p };
        try {
            const [wrows] = await pool.query(`
                SELECT Date, Weight, PhotoPath
                FROM weight_records
                WHERE PigID = ?
                ORDER BY Date ASC
            `, [pig.PigID]);

            pig.weightHistory = (wrows || []).map(r => ({
                date: r.Date instanceof Date ? r.Date.toISOString().slice(0,10) : r.Date,
                weight: (r.Weight !== null && r.Weight !== undefined) ? parseFloat(r.Weight) : null,
                img: r.PhotoPath || null
            }));

            if (pig.weightHistory.length > 0) {
                const latest = pig.weightHistory[pig.weightHistory.length - 1];
                pig.weight = latest.weight !== null ? `${latest.weight}kg` : (pig.Weight ? `${pig.Weight}kg` : '0kg');
            } else {
                // No weight_records — expose initial pig.Weight as the initial record if present
                if (pig.Weight !== undefined && pig.Weight !== null && pig.Weight !== '') {
                    const dateStr = pig.Date instanceof Date ? pig.Date.toISOString().slice(0,10) : pig.Date;
                    pig.weightHistory = [{ date: dateStr || null, weight: parseFloat(pig.Weight), img: null }];
                    pig.weight = `${parseFloat(pig.Weight)}kg`;
                } else {
                    pig.weightHistory = [];
                    pig.weight = (pig.Weight !== undefined && pig.Weight !== null) ? `${pig.Weight}kg` : '0kg';
                }
            }
        } catch (err) {
            pig.weightHistory = pig.weightHistory || [];
            pig.weight = (pig.Weight !== undefined && pig.Weight !== null) ? `${pig.Weight}kg` : '0kg';
        }

        // Expose initialWeight coming from the pig table to make it explicit for front-end
        pig.initialWeight = (pig.Weight !== undefined && pig.Weight !== null && pig.Weight !== '') ? parseFloat(pig.Weight) : null;

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

// Get weight history for a single pig (returns weight_records and initial pig.Weight)
export async function getPigWeightHistory(PigID) {
    // Normalize PigID: accept numeric ids like '5' and map to P-prefixed IDs like 'P005'
    let queryPigId = PigID;
    // If pig id is numeric (e.g., '5'), convert to 'P' + zero-padded 3 digits
    if (/^\d+$/.test(String(PigID))) {
        const n = String(PigID).padStart(3, '0');
        queryPigId = 'P' + n;
    } else if (/^\d+$/.test(String(PigID).replace(/^P/i, ''))) {
        // If it's like 'P5' or 'p5', normalize to 'P' + zero-padded
        const digits = String(PigID).replace(/^P/i, '');
        queryPigId = 'P' + String(digits).padStart(3, '0');
    }

    // Fetch pig initial weight and date (try normalized id)
    const [pigRows] = await pool.query(`SELECT PigID, Weight, Date FROM pig WHERE PigID = ?`, [queryPigId]);
    let pig = pigRows && pigRows.length ? pigRows[0] : null;

    // If not found and original PigID was not the same as queryPigId, try the original as a last resort
    if (!pig && queryPigId !== PigID) {
        const [altRows] = await pool.query(`SELECT PigID, Weight, Date FROM pig WHERE PigID = ?`, [PigID]);
        if (altRows && altRows.length) pig = altRows[0];
    }

    // Fetch weight records
    // Fetch weight records for the same normalized id (or original if pig was found by original)
    const recordsPigId = pig ? pig.PigID : queryPigId;
    const [wrows] = await pool.query(`
        SELECT Date, Weight, PhotoPath
        FROM weight_records
        WHERE PigID = ?
        ORDER BY Date ASC
    `, [recordsPigId]);

    const weightHistory = (wrows || []).map(r => ({
        date: r.Date instanceof Date ? r.Date.toISOString().slice(0,10) : r.Date,
        weight: (r.Weight !== null && r.Weight !== undefined) ? parseFloat(r.Weight) : null,
        img: r.PhotoPath || null
    }));

    // If no records and pig has a stored Weight, synthesize an initial record
    if (weightHistory.length === 0 && pig && pig.Weight !== undefined && pig.Weight !== null && pig.Weight !== '') {
        const dateStr = pig.Date instanceof Date ? pig.Date.toISOString().slice(0,10) : pig.Date;
        weightHistory.push({ date: dateStr || null, weight: parseFloat(pig.Weight), img: null });
    }

    return {
        initialWeight: pig ? (pig.Weight !== undefined && pig.Weight !== null ? parseFloat(pig.Weight) : null) : null,
        weightHistory
    };
}

// ADD delete and edit

export async function renamePig(PigID, PigName) {
    const [result] = await pool.query(
        `UPDATE pig SET PigName = ? WHERE PigID = ?`,
        [PigName, PigID]
    );
    return result;
}

export async function deletePig(PigID) {
    const [result] = await pool.query(
        `DELETE FROM pig WHERE PigID = ?`,
        [PigID]
    );
    return result;
}



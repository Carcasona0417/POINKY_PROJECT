import { pool } from "../Database/db.js";

// Get next WeightID in W001, W002, W003... format
export async function getNextWeightId() {
    try {
        // Try to get the next ID from the counter table
        const [counterRows] = await pool.query(
            'SELECT next_id FROM weight_id_counter WHERE counter_id = 1'
        );
        
        let nextNum = 1;
        if (counterRows.length > 0) {
            nextNum = counterRows[0].next_id;
        } else {
            // If counter doesn't exist, create it
            await pool.query(
                'INSERT INTO weight_id_counter (counter_id, next_id) VALUES (1, 1)'
            );
        }
        
        // Increment counter for next time
        await pool.query(
            'UPDATE weight_id_counter SET next_id = next_id + 1 WHERE counter_id = 1'
        );
        
        // Format as W001, W002, W003, etc.
        return 'W' + String(nextNum).padStart(3, '0');
    } catch (err) {
        console.error('Error getting next WeightID:', err);
        // Fallback: generate based on timestamp
        return 'W' + Date.now() + Math.random().toString(36).slice(2, 4).toUpperCase();
    }
}

// Simple function to add a weight record
export async function addWeightRecord(pigId, weight, date, photoPath = null) {
    // Normalize date to YYYY-MM-DD if a Date-like was provided
    let normalizedDate = date;
    try {
        if (date && !(typeof date === 'string')) {
            normalizedDate = (new Date(date)).toISOString().slice(0,10);
        }
    } catch (e) {
        // keep original date; DB may validate
    }

    // Prevent duplicate weight entry for the same pig and date
    try {
        const [existing] = await pool.query(`
            SELECT 1 FROM weight_records WHERE PigID = ? AND Date = ? LIMIT 1
        `, [pigId, normalizedDate]);
        if (existing && existing.length > 0) {
            const err = new Error('Duplicate weight record for this pig and date');
            err.code = 'DUPLICATE_WEIGHT_DATE';
            throw err;
        }
    } catch (checkErr) {
        // If the check threw a duplicate error, bubble it up
        if (checkErr.code === 'DUPLICATE_WEIGHT_DATE') throw checkErr;
        // otherwise continue — allow DB to report other errors
    }

    const weightId = await getNextWeightId();
    const [result] = await pool.query(`
        INSERT INTO weight_records (WeightID, Date, Weight, PigID, PhotoPath)
        VALUES (?, ?, ?, ?, ?)
    `, [weightId, normalizedDate, weight, pigId, photoPath]);
    return { WeightID: weightId, Date: normalizedDate, Weight: parseFloat(weight), PigID: pigId, PhotoPath: photoPath };
}

// Simple function to get weight history for a pig
export async function getWeightHistory(pigId) {
    const [rows] = await pool.query(`
        SELECT Date, Weight, PhotoPath
        FROM weight_records
        WHERE PigID = ?
        ORDER BY Date ASC
    `, [pigId]);
    return rows.map(r => ({
        date: r.Date instanceof Date ? r.Date.toISOString().slice(0,10) : r.Date,
        weight: (r.Weight !== null && r.Weight !== undefined) ? parseFloat(r.Weight) : null,
        img: r.PhotoPath || null
    }));
}

// Simple function to get current weight (latest record)
export async function getCurrentWeight(pigId) {
    const [rows] = await pool.query(`
        SELECT Weight
        FROM weight_records
        WHERE PigID = ?
        ORDER BY Date DESC
        LIMIT 1
    `, [pigId]);
    return rows.length > 0 ? parseFloat(rows[0].Weight) : null;
}

// Simple function to get initial weight for a pig
export async function getInitialWeight(pigId) {
    const [rows] = await pool.query(`
        SELECT Weight
        FROM pig
        WHERE PigID = ?
    `, [pigId]);
    return rows.length > 0 ? parseFloat(rows[0].Weight) : null;
}

// Function to update a weight record
export async function updateWeightRecord(pigId, weightId, weight, date, photoPath = null) {
    try {
        const updateFields = ['Weight = ?', 'Date = ?'];
        const updateValues = [weight, date];

        if (photoPath !== null && photoPath !== undefined && photoPath !== '') {
            updateFields.push('PhotoPath = ?');
            updateValues.push(photoPath);
        }

        updateValues.push(weightId);
        updateValues.push(pigId);

        const query = `
            UPDATE weight_records 
            SET ${updateFields.join(', ')}
            WHERE WeightID = ? AND PigID = ?
        `;

        const [result] = await pool.query(query, updateValues);
        
        if (result.affectedRows === 0) {
            throw new Error('Weight record not found');
        }

        return { WeightID: weightId, Date: date, Weight: parseFloat(weight), PigID: pigId, PhotoPath: photoPath };
    } catch (err) {
        throw err;
    }
}

// Function to delete a weight record
export async function deleteWeightRecord(pigId, weightId) {
    try {
        const [result] = await pool.query(`
            DELETE FROM weight_records
            WHERE WeightID = ? AND PigID = ?
        `, [weightId, pigId]);

        if (result.affectedRows === 0) {
            throw new Error('Weight record not found');
        }

        return { success: true, message: 'Weight record deleted successfully' };
    } catch (err) {
        throw err;
    }
}
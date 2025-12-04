import * as pigService from "../Logic/Add-Pig.js"
import * as weightService from "../Logic/Weight-Records.js"

// Condition for AGE depending on months
function getPigInfoByAge(age) {

    let PigType = "Piglet";
    let PigStatus = "Growing";

    if ( age < 1 ) {
        PigType = "Piglet";
    }
    else if ( age < 3 ) {
        PigType = "Starter";
    }
    else if ( age < 6 ) {
        PigType = "Grower";
    } else {
        PigType = "Finisher";
        PigStatus = "ToSale"
    }
    
    return { PigType, PigStatus }

}
export const addPig = async (req,res) => {
    try{
        const data = req.body;
        console.log("Request Body:", data);
        const { PigType, PigStatus } = getPigInfoByAge(data.Age);

        const result = await pigService.addPig({
            ...data,
            PigType,
            PigStatus
        });

        // result now contains { result, PigID }
        const PigID = result?.PigID || null;

        // Fetch the pig's weight history (including the synthesized initial record)
        let weightInfo = { initialWeight: null, weightHistory: [] };
        try {
            if (PigID) {
                weightInfo = await pigService.getPigWeightHistory(PigID);
            }
        } catch (err) {
            console.warn('Failed to load weight history after addPig', err);
        }

        // Include any inserted weight record info returned by the logic layer
        const insertedWeightRecord = result?.insertedWeightRecord || null;

        res.status(201).json({ success: true, message: "Pig added successfully", PigID, insertedWeightRecord, ...weightInfo });

    } catch (err) {
        console.error(err);
        if (err.code === 'DUPLICATE_WEIGHT_DATE') {
            return res.status(400).json({ success: false, message: 'you cannot add records on the same day on this pig' });
        }
        res.status(500).send({ success: false, message: "Error adding pig" });

    }
}

export const getAllPigs = async (req, res, next) => {
    try{
        const { farmId } = req.body;
        const rows = await pigService.getPigs(farmId);
        res.json(rows);

    }catch(err){
        next(err);
    }
}

// GET ALL PIGS FOR A USER
export const getAllUserPigs = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const pigs = await pigService.getUserPigs(userId);
        res.json({ success: true, pigs });
    } catch (err) {
        next(err);
    }
}

// GET PIGS BY FARM
export const getPigsByFarm = async (req, res, next) => {
    try {
        const { farmId } = req.body;
        // Return full pig rows for the farm so frontend can render all fields
        const rows = await pigService.getPigs(farmId);
        res.json({ success: true, pigs: rows });
    } catch (err) {
        next(err);
    }
}

// GET weight history for a single pig (lazy-load)
export const getPigWeights = async (req, res, next) => {
    try {
        const { pigId } = req.params;
        if (!pigId) return res.status(400).json({ success: false, message: 'pigId is required' });

        console.log('getPigWeights called for pigId:', pigId);
        const data = await pigService.getPigWeightHistory(pigId);
        console.log('getPigWeights response:', data);
        res.json({ success: true, pigId, ...data });
    } catch (err) {
        console.error('getPigWeights error:', err);
        next(err);
    }
}

// ADD a new weight record
export const addWeightRecord = async (req, res, next) => {
    try {
        const { pigId } = req.params;  // Extract pigId from URL path
        const { weight, date, photoPath } = req.body;  // Extract weight data from body
        
        if (!pigId || !weight || !date) {
            return res.status(400).json({ success: false, message: 'pigId, weight, and date are required' });
        }

        console.log('addWeightRecord called with:', { pigId, weight, date });
        
        const newRecord = await weightService.addWeightRecord(pigId, weight, date, photoPath || null);
        res.status(201).json({ success: true, message: 'Weight record added successfully', record: newRecord });
    } catch (err) {
        console.error('addWeightRecord error:', err.message || err);
        if (err.code === 'DUPLICATE_WEIGHT_DATE') {
            return res.status(400).json({ success: false, message: 'you cannot add records on the same day on this pig' });
        }
        if (err.message?.includes('FOREIGN KEY') || err.message?.includes('Pig') || err.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(404).json({ success: false, message: 'Pig not found in database' });
        }
        res.status(500).json({ success: false, message: 'Failed to add weight record', error: err.message });
    }
}

// UPDATE a weight record
export const updateWeightRecord = async (req, res, next) => {
    try {
        const { pigId, weightId } = req.params;
        const { weight, date, photoPath } = req.body;
        
        if (!pigId || !weightId || !weight || !date) {
            return res.status(400).json({ success: false, message: 'pigId, weightId, weight, and date are required' });
        }

        const updatedRecord = await weightService.updateWeightRecord(pigId, weightId, weight, date, photoPath);
        res.json({ success: true, message: 'Weight record updated successfully', record: updatedRecord });
    } catch (err) {
        console.error('updateWeightRecord error:', err);
        if (err.message === 'Weight record not found') {
            return res.status(404).json({ success: false, message: 'Weight record not found' });
        }
        next(err);
    }
}

// DELETE a weight record
export const deleteWeightRecord = async (req, res, next) => {
    try {
        const { pigId, weightId } = req.params;
        
        if (!pigId || !weightId) {
            return res.status(400).json({ success: false, message: 'pigId and weightId are required' });
        }

            const result = await weightService.deleteWeightRecord(pigId, weightId);
            res.json({ success: true, message: 'Weight record deleted successfully', ...result });
    } catch (err) {
        console.error('deleteWeightRecord error:', err);
            if (err.code === 'CANNOT_DELETE_INITIAL' || err.message === 'Cannot delete initial weight') {
                return res.status(400).json({ success: false, message: 'Cannot delete the initial weight record' });
            }
            if (err.message === 'Weight record not found') {
                return res.status(404).json({ success: false, message: 'Weight record not found' });
            }
        if (err.message === 'Cannot delete initial weight' || err.code === 'CANNOT_DELETE_INITIAL') {
            return res.status(400).json({ success: false, message: 'Cannot delete initial weight record' });
        }
        next(err);
    }
}

// UPDATE a pig
export const updatePig = async (req, res, next) => {
    try {
        const { pigId } = req.params;
        // Include Date (acquired date) in accepted fields
        const { PigName, Breed, Gender, Age, Date: DateAcquired, Weight, PigType, PigStatus } = req.body;
        
        if (!pigId) {
            return res.status(400).json({ success: false, message: 'pigId is required' });
        }

        const updatedPig = await pigService.updatePig(pigId, {
            PigName,
            Breed,
            Gender,
            Age,
            Date: DateAcquired,
            Weight,
            PigType,
            PigStatus
        });

        res.json({ success: true, message: 'Pig updated successfully', pig: updatedPig });
    } catch (err) {
        console.error('updatePig error:', err);
        if (err.message === 'Pig not found') {
            return res.status(404).json({ success: false, message: 'Pig not found' });
        }
        res.status(500).json({ success: false, message: 'Failed to update pig', error: err.message });
    }
}

// DELETE a pig
export const deletePig = async (req, res, next) => {
    try {
        const { pigId } = req.params;
        
        if (!pigId) {
            return res.status(400).json({ success: false, message: 'pigId is required' });
        }

        const result = await pigService.deletePig(pigId);
        res.json({ success: true, message: 'Pig deleted successfully', ...result });
    } catch (err) {
        console.error('deletePig error:', err);
        if (err.message === 'Pig not found') {
            return res.status(404).json({ success: false, message: 'Pig not found' });
        }
        res.status(500).json({ success: false, message: 'Failed to delete pig', error: err.message });
    }
}


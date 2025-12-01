import * as pigService from "../Logic/Add-Pig.js"

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

        const data = await pigService.getPigWeightHistory(pigId);
        res.json({ success: true, pigId, ...data });
    } catch (err) {
        next(err);
    }
}


import { addFarm, getUserFarms, renameFarm, deleteFarm } from "../Logic/Add-Farm.js";

export async function createFarm(req,res) {

    try{
        const { FarmName, UserID } = req.body

        const { result, FarmID } = await addFarm({ FarmName, UserID })

        res.status(200).json ({ 
            success: true,
            message: "Farm created successfully",
            FarmID: FarmID
        })
    } catch (err){
        console.error(err);
        res.status(500).json({ success: false, message: "Error adding farm" })
    }
    
}

// GET ALL FARMS FOR A USER
export async function getAllUserFarms(req, res, next) {
    try {
        const { userId } = req.body;
        const farms = await getUserFarms(userId);
        res.json({ success: true, farms });
    } catch (err) {
        next(err);
    }
}

export async function renameFarmController(req, res, next) {
    try {
        const { FarmID, FarmName } = req.body;
        if (!FarmID || !FarmName) return res.status(400).json({ success: false, message: 'Missing parameters' });
        await renameFarm(FarmID, FarmName);
        res.json({ success: true, message: 'Farm renamed successfully' });
    } catch (err) {
        next(err);
    }
}

export async function deleteFarmController(req, res, next) {
    try {
        const { FarmID } = req.body;
        if (!FarmID) return res.status(400).json({ success: false, message: 'Missing FarmID' });
        await deleteFarm(FarmID);
        res.json({ success: true, message: 'Farm deleted successfully' });
    } catch (err) {
        next(err);
    }
}
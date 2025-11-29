import { addFarm } from "../Logic/Add-Farm.js";

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
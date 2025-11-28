import * as pigService from "../Logic/Pig.js"

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

        res.status(201).json({ success: true, message: "Pig added successfully", data: result });

    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Error adding pig" });

    }
}
import { addVaccination, getVaccinations, deleteVaccination, updateVaccination } from '../Logic/vaccination.js';

// ADD A NEW VACCINATION RECORD
export const createVaccination = async (req, res) => {
    try {
        // Pass the entire request body to the service
        const vaccination = await addVaccination(req.body);

        res.json({ success: true, vaccination });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add vaccination', 
            error: err.message 
        });
    }
};

export const fetchVaccinations = async (req, res) => {
    try {
        const filters = req.query; // GET request query parameters
        const records = await getVaccinations(filters);
        res.json({ success: true, records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const modifyVaccination = async (req, res) => {
    try {
        const vaccination = await updateVaccination(req.body);
        res.json({ success: true, vaccination });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update vaccination',
            error: err.message
        });
    }
}
export const removeVaccination = async (req, res) => {
    try {
        const vaccination = await deleteVaccination(req.body);
        res.json({ success: true, vaccination });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete vaccination',
            error: err.message
        });
    }   
};


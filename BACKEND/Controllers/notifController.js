import { getNotifications } from '../Logic/notification.js';

export const fetchNotifications = async (req, res) => {
    try {
        const { userId } = req.body;
        const notifications = await getNotifications(userId);
        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

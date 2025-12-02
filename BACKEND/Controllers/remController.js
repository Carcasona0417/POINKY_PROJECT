import * as Reminder from '../Logic/Reminders.js';

// GET REMINDERS FOR A USER
export const getReminders = async (req, res) => {
    try {
        const { userId } = req.body;
        const reminders = await Reminder.getUserReminders(userId);
        res.json({ success: true, reminders });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to get reminders', error: err.message });
    }
};

// ADD A NEW REMINDER
export const createReminder = async (req, res) => {
    try {
        const data = req.body;
        const result = await Reminder.addReminder(data);
        res.json({ success: true, message: 'Reminder added successfully', reminder: result });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add reminder', error: err.message });
    }
};

// EDIT AN EXISTING REMINDER
export const editReminder = async (req, res) => {
    try {
        const { remID } = req.params;
        const data = req.body;
        const result = await Reminder.updateReminder(remID, data);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }
        res.json({ success: true, message: 'Reminder updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update reminder', error: err.message });
    }
};

// DELETE A REMINDER
export const removeReminder = async (req, res) => {
    try {
        const { remID } = req.params;
        const result = await Reminder.deleteReminder(remID);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }
        res.json({ success: true, message: 'Reminder deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete reminder', error: err.message });
    }
};

export const notification = async (req, res) => {
    try {
        const { userId } = req.body;
        const reminders = await Reminder.getUserReminders(userId);
        const notifications = reminders.filter(r => r.IsThreeDaysLeft || r.IsDueToday);
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to get notifications', error: err.message });
    }
};
import { getTotalFarms, getTotalPigs, getUpcomingReminders, getMonthExpenses, getChartData, getPieChart } from '../IrrelevantFiles/Dashboard.js';

export const getDashboardStats = async (req, res, next) => {
    try {
        const { userId } = req.body;

        // Fetch all stats in parallel for better performance
        const [totalFarmsData, totalPigsData, monthExpensesData, upcomingRemindersData] = await Promise.all([
            getTotalFarms(userId),
            getTotalPigs(userId),
            getMonthExpenses(userId),
            getUpcomingReminders(userId)
        ]);

        res.send({
            success: true,
            data: {
                totalFarms: totalFarmsData[0].totalFarms,
                totalPigs: totalPigsData[0].totalPigs,
                monthExpenses: monthExpensesData[0].monthExpenses,
                upcomingReminders: upcomingRemindersData[0].upcomingReminders
            }
        });

    } catch (err) {
        next(err);
    }
};

export const getTotalFarmsData = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const rows = await getTotalFarms(userId);
        res.json({ totalFarms: rows[0].totalFarms });

    } catch (err) {
        next(err);
    }
};

export const getTotalPigsData = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const rows = await getTotalPigs(userId);
        res.send({ totalPigs: rows[0].totalPigs });

    } catch (err) {
        next(err);
    }
};

export const getMonthExpensesData = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const rows = await getMonthExpenses(userId);
        res.send({ monthExpenses: rows[0].monthExpenses });

    } catch (err) {
        next(err);
    }
};

export const getUpcomingRemindersData = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const rows = await getUpcomingReminders(userId);
        res.send({ upcomingReminders: rows[0].upcomingReminders });

    } catch (err) {
        next(err);
    }
};

export const getBarChartData = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const rows = await getChartData(userId);
        res.send({ chartData: rows });

    } catch (err) {
        next(err);
    }
};

export const getPieChartData = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const data = await getPieChart(userId);
        
        res.send({
            success: true,
            data: {
                feed: data.feed || 0,
                piglets: data.piglets || 0,
                medical: data.medical || 0,
                utilities: data.utilities || 0,
                labor: data.labor || 0,
                maintenance: data.maintenance || 0
            }
        });

    } catch (err) {
        next(err);
    }
};

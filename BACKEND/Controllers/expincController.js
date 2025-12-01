import { 
    getUserExpenses, 
    getUserExpensesTable, 
    getSoldTable, 
    getTotalExpenses,
    getEstimatedIncome,
    getProjectedProfit,
    getFeedExpenses,
    getMedicineExpenses,
    getTransportationExpenses,
    getPigletsExpenses,
    getLaborExpenses,
    getUtilitiesExpenses,
    getFarmsForUser,
    getPigsForUser,
    getExpenseCategories,
    addExpense,
    editExpense,
    deleteExpense,
    cancelSoldPig,
    getUserExpensesFiltered,
    getTotalExpensesFiltered,
    getEstimatedIncomeFiltered,
    getProjectedProfitFiltered,
    getFeedExpensesFiltered,
    getMedicineExpensesFiltered,
    getTransportationExpensesFiltered,
    getPigletsExpensesFiltered,
    getLaborExpensesFiltered,
    getUtilitiesExpensesFiltered
} from "../Logic/ExpensesIncome.js";

// ============================================
// EXISTING CONTROLLERS
// ============================================

// BAR CHART
export const getUserExpensesData = async(req, res, next) => {
    try {
        const {userId} = req.body;
        const rows = await getUserExpenses(userId);
        res.send({ EIData: rows });
    } catch (err){
        next(err);
    }
}

// EXPENSES FULL LIST TABLE
export const getUserTableData = async(req, res, next) => {
    try{
        const {userId} = req.body;
        const rows = await getUserExpensesTable(userId);
        res.send({ExpenseTable: rows});
    } catch (err){
        next(err);
    }
}

// SOLD PIGS TABLE
export const getSoldTabledata = async(req, res, next) => {
    try{
        const {userId} = req.body;
        const rows = await getSoldTable(userId);
        res.send({SoldTable: rows})
    } catch (err){
        next(err);
    }
}

// SUMMARY FOR EXPENSES REPORTS
export const getTotalExpensesData = async(req, res, next) => {
    try{
        const {userId} = req.body;
        const rows = await getTotalExpenses(userId);
        res.send({TotalExpense: rows})
    } catch (err){
        next(err);
    }
}

// ============================================
// NEW CONTROLLERS - INCOME & PROFIT
// ============================================

// ESTIMATED INCOME FROM GROWING PIGS
export const getEstimatedIncomeData = async(req, res, next) => {
    try {
        const { userId, farmId } = req.body;
        const data = await getEstimatedIncome(userId);
        res.send({ EstimatedIncome: data });
    } catch (err) {
        next(err);
    }
}

// PROJECTED PROFIT CALCULATION
export const getProjectedProfitData = async(req, res, next) => {
    try {
        const { userId, farmId } = req.body;
        const data = await getProjectedProfit(userId);
        res.send({ ProjectedProfit: data });
    } catch (err) {
        next(err);
    }
}

// ============================================
// NEW CONTROLLERS - EXPENSE CATEGORIES
// ============================================

// FEED EXPENSES
export const getFeedExpensesData = async(req, res, next) => {
    try {
        const { userId } = req.body;
        const data = await getFeedExpenses(userId);
        res.send({ FeedExpenses: data });
    } catch (err) {
        next(err);
    }
}

// MEDICINE EXPENSES
export const getMedicineExpensesData = async(req, res, next) => {
    try {
        const { userId } = req.body;
        const data = await getMedicineExpenses(userId);
        res.send({ MedicineExpenses: data });
    } catch (err) {
        next(err);
    }
}

// TRANSPORTATION EXPENSES
export const getTransportationExpensesData = async(req, res, next) => {
    try {
        const { userId } = req.body;
        const data = await getTransportationExpenses(userId);
        res.send({ TransportationExpenses: data });
    } catch (err) {
        next(err);
    }
}

// PIGLETS EXPENSES
export const getPigletsExpensesData = async(req, res, next) => {
    try {
        const { userId } = req.body;
        const data = await getPigletsExpenses(userId);
        res.send({ PigletsExpenses: data });
    } catch (err) {
        next(err);
    }
}

// LABOR EXPENSES
export const getLaborExpensesData = async(req, res, next) => {
    try {
        const { userId } = req.body;
        const data = await getLaborExpenses(userId);
        res.send({ LaborExpenses: data });
    } catch (err) {
        next(err);
    }
}

// UTILITIES EXPENSES
export const getUtilitiesExpensesData = async(req, res, next) => {
    try {
        const { userId } = req.body;
        const data = await getUtilitiesExpenses(userId);
        res.send({ UtilitiesExpenses: data });
    } catch (err) {
        next(err);
    }
}

// ============================================
// DROPDOWN FILTER CONTROLLERS
// ============================================

// GET FARMS FOR DROPDOWN
export const getFarmsDropdown = async(req, res, next) => {
    try {
        const { userId } = req.body;
        const farms = await getFarmsForUser(userId);
        res.json({ success: true, farms });
    } catch (err) {
        next(err);
    }
}

// GET PIGS FOR DROPDOWN
export const getPigsDropdown = async(req, res, next) => {
    try {
        const { userId } = req.body;
        const pigs = await getPigsForUser(userId);
        res.json({ success: true, pigs });
    } catch (err) {
        next(err);
    }
}

// GET EXPENSE CATEGORIES FOR DROPDOWN
export const getCategoriesDropdown = async(req, res, next) => {
    try {
        const categories = getExpenseCategories();
        res.json({ success: true, categories });
    } catch (err) {
        next(err);
    }
}

// ============================================
// EXPENSE CRUD CONTROLLERS
// ============================================

// ADD NEW EXPENSE
export const addNewExpense = async(req, res, next) => {
    try {
        const { UserID, PigID, Date, Amount, Category } = req.body;
        
        // Validate required fields
        if (!UserID || !PigID || !Date || !Amount || !Category) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }
        
        const result = await addExpense({ UserID, PigID, Date, Amount, Category });
        res.status(201).json({ 
            success: true, 
            message: 'Expense added successfully', 
            data: result 
        });
    } catch (err) {
        next(err);
    }
}

// EDIT EXISTING EXPENSE
export const editExistingExpense = async(req, res, next) => {
    try {
        const { ExpID, UserID, Date, Amount, Category } = req.body;
        
        // Validate required fields
        if (!ExpID || !UserID || !Date || !Amount || !Category) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }
        
        const result = await editExpense(ExpID, { Date, Amount, Category });
        res.json({ 
            success: true, 
            message: 'Expense updated successfully', 
            data: result 
        });
    } catch (err) {
        next(err);
    }
}

// DELETE EXPENSE
export const deleteExistingExpense = async(req, res, next) => {
    try {
        const { ExpID, UserID } = req.body;
        
        if (!ExpID || !UserID) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }
        
        const result = await deleteExpense(ExpID, UserID);
        res.json({ 
            success: true, 
            message: 'Expense deleted successfully', 
            data: result 
        });
    } catch (err) {
        next(err);
    }
}

// ============================================
// SOLD PIG MANAGEMENT CONTROLLER
// ============================================

// CANCEL SOLD PIG - Revert status to ToSale
export const cancelSoldPigRecord = async(req, res, next) => {
    try {
        const { ExpID, UserID } = req.body;
        
        if (!ExpID || !UserID) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }
        
        const result = await cancelSoldPig(ExpID, UserID);
        res.json({ 
            success: true, 
            message: 'Sold record cancelled. Pig status reverted to ToSale', 
            data: result 
        });
    } catch (err) {
        next(err);
    }
}

// ============================================
// FILTERED CONTROLLERS (with filters)
// ============================================

// FILTERED: BAR CHART DATA
export const getUserExpensesDataFiltered = async(req, res, next) => {
    try {
        const { userId, filters } = req.body;
        const rows = await getUserExpensesFiltered(userId, filters);
        res.send({ EIData: rows });
    } catch (err) {
        next(err);
    }
}

// FILTERED: TOTAL EXPENSES
export const getTotalExpensesDataFiltered = async(req, res, next) => {
    try {
        const { userId, filters } = req.body;
        const rows = await getTotalExpensesFiltered(userId, filters);
        res.send({ TotalExpense: rows });
    } catch (err) {
        next(err);
    }
}

// FILTERED: ESTIMATED INCOME
export const getEstimatedIncomeDataFiltered = async(req, res, next) => {
    try {
        const { userId, filters } = req.body;
        const data = await getEstimatedIncomeFiltered(userId, filters);
        res.send({ EstimatedIncome: data });
    } catch (err) {
        next(err);
    }
}

// FILTERED: PROJECTED PROFIT
export const getProjectedProfitDataFiltered = async(req, res, next) => {
    try {
        const { userId, filters } = req.body;
        const data = await getProjectedProfitFiltered(userId, filters);
        res.send({ ProjectedProfit: data });
    } catch (err) {
        next(err);
    }
}

// FILTERED: FEED EXPENSES
export const getFeedExpensesDataFiltered = async(req, res, next) => {
    try {
        const { userId, filters } = req.body;
        const data = await getFeedExpensesFiltered(userId, filters);
        res.send({ FeedExpenses: data });
    } catch (err) {
        next(err);
    }
}

// FILTERED: MEDICINE EXPENSES
export const getMedicineExpensesDataFiltered = async(req, res, next) => {
    try {
        const { userId, filters } = req.body;
        const data = await getMedicineExpensesFiltered(userId, filters);
        res.send({ MedicineExpenses: data });
    } catch (err) {
        next(err);
    }
}

// FILTERED: TRANSPORTATION EXPENSES
export const getTransportationExpensesDataFiltered = async(req, res, next) => {
    try {
        const { userId, filters } = req.body;
        const data = await getTransportationExpensesFiltered(userId, filters);
        res.send({ TransportationExpenses: data });
    } catch (err) {
        next(err);
    }
}

// FILTERED: PIGLETS EXPENSES
export const getPigletsExpensesDataFiltered = async(req, res, next) => {
    try {
        const { userId, filters } = req.body;
        const data = await getPigletsExpensesFiltered(userId, filters);
        res.send({ PigletsExpenses: data });
    } catch (err) {
        next(err);
    }
}

// FILTERED: LABOR EXPENSES
export const getLaborExpensesDataFiltered = async(req, res, next) => {
    try {
        const { userId, filters } = req.body;
        const data = await getLaborExpensesFiltered(userId, filters);
        res.send({ LaborExpenses: data });
    } catch (err) {
        next(err);
    }
}

// FILTERED: UTILITIES EXPENSES
export const getUtilitiesExpensesDataFiltered = async(req, res, next) => {
    try {
        const { userId, filters } = req.body;
        const data = await getUtilitiesExpensesFiltered(userId, filters);
        res.send({ UtilitiesExpenses: data });
    } catch (err) {
        next(err);
    }
}

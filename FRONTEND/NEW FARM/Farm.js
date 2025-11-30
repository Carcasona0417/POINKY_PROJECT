// ======================================================================
// POINKY FARM.JS
// - Farms, pigs, list, filters, status, Add Pig
// - Opens pig-details.html in an iframe modal
// - Exposes getPigDataById + open*FromDetails for the iframe
// ======================================================================

// =========================================================================
// 🧠 GLOBAL STATE (accessible by iframe + main page)
// =========================================================================
let farms = [
    {
        id: 1,
        name: "Farm 1",
        pigs: [
            {
                id: 1,
                name: "Babe",
                breed: "Large White",
                gender: "female",
                age: "6",
                date: "2025-01-01",
                shortId: "BAB",
                weight: "30kg",
                status: "growing",
                weightHistory: [{ date: "2025-01-01", weight: 30 }],
                expenses: [ { date: "2025-03-01", price: 200 }, { date: "2025-04-15", price: 150 } ],
                statusHistory: [{ date: "2025-01-01", status: "growing", notes: "Initial" }]
            },
            {
                id: 2,
                name: "Porky",
                breed: "Berkshire",
                gender: "male",
                age: "8",
                date: "2024-12-10",
                shortId: "POR",
                weight: "45kg",
                status: "growing",
                weightHistory: [{ date: "2025-02-15", weight: 45 }],
                expenses: [ { date: "2025-02-20", price: 300 } ],
                statusHistory: [{ date: "2024-12-10", status: "growing", notes: "Initial" }]
            },
            {
                id: 3,
                name: "Snort",
                breed: "Duroc",
                gender: "male",
                age: "5",
                date: "2025-02-01",
                shortId: "SNO",
                weight: "25kg",
                status: "growing",
                weightHistory: [{ date: "2025-02-01", weight: 25 }],
                expenses: [],
                statusHistory: [{ date: "2025-02-01", status: "growing", notes: "Initial" }]
            }
        ]
    },
    { id: 2, name: "Farm 2", pigs: [] },
    { id: 3, name: "Farm 3", pigs: [] }
];

let currentFarmId                = 1;
let nextFarmId                   = 4;
let nextPigId                    = 4; // IDs 1..3 used by demo pigs
let currentDetailPigId           = null;  // pig whose details we’re viewing
let currentDetailFarmId          = null;  // farm of that pig
let currentEditWeightRecordIndex = null;
let currentEditExpenseIndex      = null;
let currentEditVaccinationIndex  = null;
let currentEditFarmId            = null;  // used for rename/delete farm UI
let pendingDeleteData            = null;  // stores data for pending deletion confirmation

// Helpers usable everywhere
const getCurrentFarm = () => farms.find(farm => farm.id === currentFarmId);
const getFarmById    = (id) => farms.find(farm => farm.id === Number(id));

function formatStatusText(status) {
    const statusMap = {
        growing:  "Growing",
        tosale:   "To Sale",
        sold:     "Sold",
        deceased: "Deceased"
    };
    return statusMap[status] || status;
}

// ======================================================================
// 🌐 FUNCTIONS EXPOSED TO pig-details.html (IFRAME)
// ======================================================================

// Called inline in farm.html from pig badge
window.openPigDetails = function (pigId, farmId) {
    const pigDetailsModal = document.getElementById("pigDetailsModal");
    const pigDetailsFrame = document.getElementById("pigDetailsFrame");

    if (!pigDetailsModal || !pigDetailsFrame) return;

    currentDetailPigId  = Number(pigId);
    currentDetailFarmId = Number(farmId);

    const url = `pig-details.html?id=${encodeURIComponent(pigId)}&farm=${encodeURIComponent(farmId)}`;
    pigDetailsFrame.src = url;

    // Fallback: post pig data to iframe via postMessage once it loads
    const onFrameLoad = function () {
        try {
            const pigObj = window.getPigDataById ? window.getPigDataById(pigId, farmId) : null;
            if (pigObj && pigDetailsFrame.contentWindow) {
                pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: pigObj }, "*");
            }
        } catch (err) {
            console.warn("Failed to postMessage to pig-details iframe:", err);
        } finally {
            pigDetailsFrame.removeEventListener("load", onFrameLoad);
        }
    };

    pigDetailsFrame.addEventListener("load", onFrameLoad);

    pigDetailsModal.style.display = "flex";
    document.body.style.overflow  = "hidden";
};

// Called from pig-details.html via window.parent.getPigDataById(...)
window.getPigDataById = function (pigId, farmId) {
    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return null;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    if (!pig) return null;

    // deep clone so iframe cannot mutate original
    return JSON.parse(JSON.stringify(pig));
};

// Called from pig-details.html when clicking "Add Weight"
window.openAddWeightFromDetails = function (pigId, farmId) {
    const addWeightModal    = document.getElementById("addWeightModal");
    const pigDetailsModal   = document.getElementById("pigDetailsModal");
    const newWeightImgInput = document.getElementById("newWeightImg");
    const fileNameDisplay   = document.getElementById("fileNameDisplay");
    const dateInput         = document.getElementById("newWeightDate");
    const weightInput       = document.getElementById("newWeightValue");

    if (!addWeightModal) return;

    currentDetailPigId  = Number(pigId);
    currentDetailFarmId = Number(farmId);

    // Hide details while editing weight
    if (pigDetailsModal) pigDetailsModal.style.display = "none";

    // Clear inputs and let user choose any date
    if (dateInput)   dateInput.value   = "";
    if (weightInput) weightInput.value = "";
    if (newWeightImgInput) newWeightImgInput.value = "";

    if (fileNameDisplay) {
        fileNameDisplay.textContent      = "Upload Image";
        fileNameDisplay.style.color      = "var(--text-light)";
        fileNameDisplay.style.fontStyle  = "italic";
    }

    addWeightModal.style.display = "flex";
};

// Called from pig-details.html when clicking "Add Expense"
window.openAddExpenseFromDetails = function (pigId, farmId) {
    const addExpenseModal = document.getElementById("addExpenseModal");
    const pigDetailsModal = document.getElementById("pigDetailsModal");
    const dateInput       = document.getElementById("expenseDate");
    const priceInput      = document.getElementById("expensePrice");
    const categorySelect  = document.getElementById("expenseCategory");

    if (!addExpenseModal) return;

    currentDetailPigId  = Number(pigId);
    currentDetailFarmId = Number(farmId);

    if (pigDetailsModal) pigDetailsModal.style.display = "none";

    // Clear inputs and let user choose any date
    if (dateInput)      dateInput.value   = "";
    if (priceInput)     priceInput.value  = "";
    if (categorySelect) categorySelect.value = "";

    addExpenseModal.style.display = "flex";
};

// Called from pig-details.html when clicking "Add Vaccination"
window.openAddVaccinationFromDetails = function (pigId, farmId) {
    const addVaccinationModal = document.getElementById("addVaccinationModal");
    const pigDetailsModal     = document.getElementById("pigDetailsModal");
    const dateInput           = document.getElementById("vaccDate");
    const dueDateInput        = document.getElementById("vaccDueDate");
    const typeSelect          = document.getElementById("vaccType");

    if (!addVaccinationModal) return;

    currentDetailPigId  = Number(pigId);
    currentDetailFarmId = Number(farmId);

    if (pigDetailsModal) pigDetailsModal.style.display = "none";

    // Clear inputs and let user choose any dates
    if (dateInput)    dateInput.value    = "";
    if (dueDateInput) dueDateInput.value = "";
    if (typeSelect)   typeSelect.value   = "";

    addVaccinationModal.style.display = "flex";
};

// NEW: Called from pig-details.html when clicking "Edit Pig Details"
window.openEditPigDetailsFromDetails = function (pigId, farmId) {
    const editModal    = document.getElementById("editPigDetailsModal");
    const shortIdLabel = document.getElementById("editPigShortIdDisplay");

    if (!editModal) return;

    currentDetailPigId  = Number(pigId);
    currentDetailFarmId = Number(farmId);

    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    if (!pig) return;

    // Hide details while editing
    const pigDetailsModal = document.getElementById("pigDetailsModal");
    if (pigDetailsModal) pigDetailsModal.style.display = "none";

    // Populate form
    const nameInput   = document.getElementById("editPigName");
    const breedInput  = document.getElementById("editPigBreed");
    const genderInput = document.getElementById("editPigGender");
    const ageInput    = document.getElementById("editPigAge");
    const dateInput   = document.getElementById("editPigDate");

    if (nameInput)   nameInput.value   = pig.name   || "";
    if (breedInput)  breedInput.value  = pig.breed  || "";
    if (genderInput) genderInput.value = pig.gender || "";
    if (ageInput)    ageInput.value    = pig.age    || "";
    if (dateInput)   dateInput.value   = pig.date   || "";

    if (shortIdLabel) {
        const fallbackShort = pig.name ? pig.name.substring(0, 3).toUpperCase() : "PIG";
        shortIdLabel.textContent = `Editing: ${pig.id} (${pig.shortId || fallbackShort})`;
    }

    // Trigger floating label updates for selects that have values
    [breedInput, genderInput, ageInput].forEach(select => {
        if (select && select.value) {
            select.classList.add("has-value");
        }
    });

    // Trigger floating label updates for date wrapper
    if (dateInput && dateInput.value) {
        const dateWrapper = dateInput.closest(".date-wrapper");
        if (dateWrapper) dateWrapper.classList.add("has-value");
    }

    editModal.style.display = "flex";
};

// Called from pig-details.html when clicking "Delete Pig"
window.openDeletePigFromDetails = function (pigId, farmId) {
    const delModal = document.getElementById('deletePigConfirmModal');
    if (!delModal) return;

    currentDetailPigId  = Number(pigId);
    currentDetailFarmId = Number(farmId);

    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    const confirmText = document.getElementById('deletePigConfirmText');
    if (confirmText) confirmText.innerHTML = `Are you sure you want to delete <strong>${pig?.name || 'this pig'}</strong>?<br>This action cannot be undone.`;

    // clear input state
    const input = document.getElementById('confirmDeletePigInput');
    const confirmBtn = document.getElementById('confirmDeletePig');
    if (input) input.value = '';
    if (confirmBtn) confirmBtn.disabled = true;

    delModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

// ======================================================================
// EDIT/DELETE RECORD FUNCTIONS (called from pig-details.html)
// ======================================================================

// WEIGHT RECORD EDIT
window.openEditWeightFromDetails = function (pigId, farmId, data) {
    const addWeightModal = document.getElementById("addWeightModal");
    if (!addWeightModal) return;

    currentDetailPigId = Number(pigId);
    currentDetailFarmId = Number(farmId);
    currentEditWeightRecordIndex = data?.index;

    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    if (!pig || currentEditWeightRecordIndex === undefined) return;

    const record = pig.weightHistory[currentEditWeightRecordIndex];
    if (!record) return;
    console.debug("openEditWeightFromDetails called", { pigId, farmId, index: currentEditWeightRecordIndex, record });

    // Populate form with existing values
    const dateInput = document.getElementById("newWeightDate");
    const weightInput = document.getElementById("newWeightValue");
    const fileNameDisplay = document.getElementById("fileNameDisplay");
    const weightHint = document.getElementById("weightHint");

    if (dateInput) dateInput.value = record.date;
    if (weightInput) weightInput.value = record.weight;
    if (fileNameDisplay) fileNameDisplay.textContent = "Edit Image (optional)";

    // Show last recorded data hint
    if (weightHint) {
        if (currentEditWeightRecordIndex > 0) {
            const lastRecord = pig.weightHistory[currentEditWeightRecordIndex - 1];
            const weightDiff = (record.weight - lastRecord.weight).toFixed(1);
            const diffSign = weightDiff >= 0 ? "+" : "";
            weightHint.innerHTML = `<strong>Last recorded:</strong> ${lastRecord.weight}kg on ${lastRecord.date} (${diffSign}${weightDiff}kg change)`;
            weightHint.style.display = "block";
            try { weightHint.dataset.persistent = "true"; } catch(e){}
            setTimeout(() => { try { if (weightHint && weightHint.dataset.persistent === "true") weightHint.style.display = 'block'; } catch(e){} }, 50);
        } else {
            weightHint.style.display = "none";
        }
    }

    // Hide details modal
    const pigDetailsModal = document.getElementById("pigDetailsModal");
    if (pigDetailsModal) pigDetailsModal.style.display = "none";

    addWeightModal.style.display = "flex";
};

// WEIGHT RECORD DELETE
window.deleteWeightFromDetails = function (pigId, farmId, data) {
    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    if (!pig) return;

    const index = data?.index;
    if (index !== undefined && pig.weightHistory && pig.weightHistory[index]) {
        pig.weightHistory.splice(index, 1);

        // Refresh pig details
        const pigDetailsFrame = document.getElementById("pigDetailsFrame");
        if (pigDetailsFrame && pigDetailsFrame.contentWindow) {
            const updatedPig = getPigDataById(pigId, farmId);
            pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
        }
    }
};

// EXPENSE RECORD EDIT
window.openEditExpenseFromDetails = function (pigId, farmId, data) {
    const addExpenseModal = document.getElementById("addExpenseModal");
    if (!addExpenseModal) return;

    currentDetailPigId = Number(pigId);
    currentDetailFarmId = Number(farmId);
    currentEditExpenseIndex = data?.index;

    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    if (!pig || currentEditExpenseIndex === undefined) return;

    const record = pig.expenses[currentEditExpenseIndex];
    if (!record) return;

    console.debug("openEditExpenseFromDetails called", { pigId, farmId, index: currentEditExpenseIndex, record });

    // Populate form with existing values
    const dateInput = document.getElementById("expenseDate");
    const priceInput = document.getElementById("expensePrice");
    const categorySelect = document.getElementById("expenseCategory");
    const expenseHint = document.getElementById("expenseHint");

    if (dateInput) dateInput.value = record.date;
    if (priceInput) priceInput.value = record.price;
    if (categorySelect) categorySelect.value = record.category || "";

    // Show last recorded data hint
    if (expenseHint) {
        if (currentEditExpenseIndex > 0) {
            const lastRecord = pig.expenses[currentEditExpenseIndex - 1];
            expenseHint.innerHTML = `<strong>Last recorded:</strong> ₱${lastRecord.price} on ${lastRecord.date} (${lastRecord.category})`;
            expenseHint.style.display = "block";
            try { expenseHint.dataset.persistent = "true"; } catch(e){}
            setTimeout(() => { try { if (expenseHint && expenseHint.dataset.persistent === "true") expenseHint.style.display = 'block'; } catch(e){} }, 50);
        } else {
            expenseHint.style.display = "none";
        }
    }

    // Hide details modal
    const pigDetailsModal = document.getElementById("pigDetailsModal");
    if (pigDetailsModal) pigDetailsModal.style.display = "none";

    addExpenseModal.style.display = "flex";
};

// EXPENSE RECORD DELETE
window.deleteExpenseFromDetails = function (pigId, farmId, data) {
    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    if (!pig) return;

    const index = data?.index;
    if (index !== undefined && pig.expenses && pig.expenses[index]) {
        pig.expenses.splice(index, 1);

        // Refresh pig details
        const pigDetailsFrame = document.getElementById("pigDetailsFrame");
        if (pigDetailsFrame && pigDetailsFrame.contentWindow) {
            const updatedPig = getPigDataById(pigId, farmId);
            pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
        }
    }
};

// VACCINATION RECORD EDIT
window.openEditVaccinationFromDetails = function (pigId, farmId, data) {
    const addVaccinationModal = document.getElementById("addVaccinationModal");
    if (!addVaccinationModal) return;

    currentDetailPigId = Number(pigId);
    currentDetailFarmId = Number(farmId);
    currentEditVaccinationIndex = data?.index;

    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    if (!pig || currentEditVaccinationIndex === undefined) return;

    const record = pig.vaccinations[currentEditVaccinationIndex];
    if (!record) return;

    console.debug("openEditVaccinationFromDetails called", { pigId, farmId, index: currentEditVaccinationIndex, record });

    // Populate form with existing values
    const dateInput = document.getElementById("vaccDate");
    const dueDateInput = document.getElementById("vaccDueDate");
    const typeSelect = document.getElementById("vaccType");

    if (dateInput) dateInput.value = record.date;
    if (dueDateInput) dueDateInput.value = record.dueDate;
    if (typeSelect) typeSelect.value = record.type || "";

    // Hide details modal
    const pigDetailsModal = document.getElementById("pigDetailsModal");
    if (pigDetailsModal) pigDetailsModal.style.display = "none";

    addVaccinationModal.style.display = "flex";
};

// VACCINATION RECORD DELETE
window.deleteVaccinationFromDetails = function (pigId, farmId, data) {
    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
    if (!farm) return;

    const pig = farm.pigs.find(p => p.id === Number(pigId));
    if (!pig) return;

    const index = data?.index;
    if (index !== undefined && pig.vaccinations && pig.vaccinations[index]) {
        pig.vaccinations.splice(index, 1);

        // Refresh pig details
        const pigDetailsFrame = document.getElementById("pigDetailsFrame");
        if (pigDetailsFrame && pigDetailsFrame.contentWindow) {
            const updatedPig = getPigDataById(pigId, farmId);
            pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
        }
    }
};

// ======================================================================
// DELETE RECORD CONFIRMATION MODALS
// ======================================================================

// Confirm Weight Delete
window.confirmDeleteWeight = function (pigId, farmId, data) {
    const modal = document.getElementById("deleteRecordConfirmModal");
    const title = document.getElementById("deleteRecordTitle");
    const text = document.getElementById("deleteRecordConfirmText");
    
    if (!modal) return;
    
    pendingDeleteData = {
        type: "weight",
        pigId: Number(pigId),
        farmId: Number(farmId),
        index: data?.index
    };
    
    if (title) title.textContent = "Delete Weight Record";
    if (text) text.innerHTML = "Are you sure you want to delete this weight record?<br>This action cannot be undone.";
    
    modal.style.display = "flex";
};

// Confirm Expense Delete
window.confirmDeleteExpense = function (pigId, farmId, data) {
    const modal = document.getElementById("deleteRecordConfirmModal");
    const title = document.getElementById("deleteRecordTitle");
    const text = document.getElementById("deleteRecordConfirmText");
    
    if (!modal) return;
    
    pendingDeleteData = {
        type: "expense",
        pigId: Number(pigId),
        farmId: Number(farmId),
        index: data?.index
    };
    
    if (title) title.textContent = "Delete Expense Record";
    if (text) text.innerHTML = "Are you sure you want to delete this expense record?<br>This action cannot be undone.";
    
    modal.style.display = "flex";
};

// Confirm Vaccination Delete
window.confirmDeleteVaccination = function (pigId, farmId, data) {
    const modal = document.getElementById("deleteRecordConfirmModal");
    const title = document.getElementById("deleteRecordTitle");
    const text = document.getElementById("deleteRecordConfirmText");
    
    if (!modal) return;
    
    pendingDeleteData = {
        type: "vaccination",
        pigId: Number(pigId),
        farmId: Number(farmId),
        index: data?.index
    };
    
    if (title) title.textContent = "Delete Vaccination Record";
    if (text) text.innerHTML = "Are you sure you want to delete this vaccination record?<br>This action cannot be undone.";
    
    modal.style.display = "flex";
};

// ----------------------------
// MESSAGE HANDLER (iframe → parent)
// ----------------------------
window.addEventListener("message", (ev) => {
    try {
        const data = ev && ev.data;
        if (!data || data.type !== "openAction") return;

        const action = data.action;
        const pigId  = data.pigId;
        const farmId = data.farmId;

        // Route the action to the appropriate function if available
        switch (action) {
            case "openAddWeightFromDetails":
                if (typeof window.openAddWeightFromDetails === "function") {
                    window.openAddWeightFromDetails(pigId, farmId);
                }
                break;
            case "openAddExpenseFromDetails":
                if (typeof window.openAddExpenseFromDetails === "function") {
                    window.openAddExpenseFromDetails(pigId, farmId);
                }
                break;
            case "openAddVaccinationFromDetails":
                if (typeof window.openAddVaccinationFromDetails === "function") {
                    window.openAddVaccinationFromDetails(pigId, farmId);
                }
                break;
            case "openEditPigDetails":
                if (typeof window.openEditPigDetailsFromDetails === "function") {
                    window.openEditPigDetailsFromDetails(pigId, farmId);
                }
                break;
            case "openDeletePigFromDetails":
                if (typeof window.openDeletePigFromDetails === "function") {
                    window.openDeletePigFromDetails(pigId, farmId);
                }
                break;
            default:
                console.warn("Farm.js received unknown openAction from iframe:", action);
        }
    } catch (e) {
        console.warn("Farm.js message handler error:", e);
    }
});

// ----------------------------
// MESSAGE HANDLER FOR RECORD ACTIONS (edit/delete)
// ----------------------------
window.addEventListener("message", (ev) => {
    try {
        const data = ev && ev.data;
        if (!data || data.type !== "recordAction") return;

        const action = data.action;
        const pigId  = data.pigId;
        const farmId = data.farmId;
        const recordData = data.data;

        // Route the action to the appropriate function if available
        switch (action) {
            case "openEditWeightFromDetails":
                if (typeof window.openEditWeightFromDetails === "function") {
                    window.openEditWeightFromDetails(pigId, farmId, recordData);
                }
                break;
            case "deleteWeightFromDetails":
                if (typeof window.confirmDeleteWeight === "function") {
                    window.confirmDeleteWeight(pigId, farmId, recordData);
                } else if (typeof window.deleteWeightFromDetails === "function") {
                    window.deleteWeightFromDetails(pigId, farmId, recordData);
                }
                break;
            case "openEditExpenseFromDetails":
                if (typeof window.openEditExpenseFromDetails === "function") {
                    window.openEditExpenseFromDetails(pigId, farmId, recordData);
                }
                break;
            case "deleteExpenseFromDetails":
                if (typeof window.confirmDeleteExpense === "function") {
                    window.confirmDeleteExpense(pigId, farmId, recordData);
                } else if (typeof window.deleteExpenseFromDetails === "function") {
                    window.deleteExpenseFromDetails(pigId, farmId, recordData);
                }
                break;
            case "openEditVaccinationFromDetails":
                if (typeof window.openEditVaccinationFromDetails === "function") {
                    window.openEditVaccinationFromDetails(pigId, farmId, recordData);
                }
                break;
            case "confirmDeleteWeight":
                if (typeof window.confirmDeleteWeight === "function") {
                    window.confirmDeleteWeight(pigId, farmId, recordData);
                }
                break;
            case "confirmDeleteExpense":
                if (typeof window.confirmDeleteExpense === "function") {
                    window.confirmDeleteExpense(pigId, farmId, recordData);
                }
                break;
            case "confirmDeleteVaccination":
                if (typeof window.confirmDeleteVaccination === "function") {
                    window.confirmDeleteVaccination(pigId, farmId, recordData);
                }
                break;
            case "deleteVaccinationFromDetails":
                if (typeof window.confirmDeleteVaccination === "function") {
                    window.confirmDeleteVaccination(pigId, farmId, recordData);
                } else if (typeof window.deleteVaccinationFromDetails === "function") {
                    window.deleteVaccinationFromDetails(pigId, farmId, recordData);
                }
                break;
            default:
                console.warn("Farm.js received unknown recordAction from iframe:", action);
        }
    } catch (e) {
        console.warn("Farm.js recordAction handler error:", e);
    }
});

// ======================================================================
// MAIN SCRIPT (runs once DOM is ready)
// ======================================================================

document.addEventListener("DOMContentLoaded", function () {

    // =========================================================================
    // 💡 DOM ELEMENT REFERENCES
    // =========================================================================

    // Table / list
    const selectAllCheckbox      = document.getElementById("selectAll");
    const tableSelectAllCheckbox = document.getElementById("tableSelectAll");
    const pigsTableBody          = document.getElementById("pigsTableBody");
    let   pigCheckboxes          = document.querySelectorAll(".pig-checkbox");
    let   pigRows                = document.querySelectorAll(".pig-row");

    // Tabs / farms
    const tabsContainer = document.querySelector(".tabs-header");
    const tabs          = document.querySelectorAll(".tab");
    const tabAdd        = document.querySelector(".tab-add");

    // Filters / search / status dropdown
    const filterItems    = document.querySelectorAll(".filter-item");
    const dropdown       = document.getElementById("statusDropdown");
    const dropdownToggle = dropdown?.querySelector(".dropdown-toggle");
    const dropdownItems  = dropdown?.querySelectorAll(".dropdown-item");
    const searchInput    = document.getElementById("searchInput");

    // Summary counts
    const activePigsCount = document.getElementById("activePigsCount");
    const showingCount    = document.getElementById("showingCount");
    const totalCount      = document.getElementById("totalCount");

    // Main UI buttons
    const addPigBtn       = document.getElementById("addPigBtn");
    const notificationBtn = document.getElementById("notificationBtn");

    // Modals
    const addPigModal         = document.getElementById("addPigModal");
    const addWeightModal      = document.getElementById("addWeightModal");
    const editWeightModal     = document.getElementById("editWeightModal");       // optional
    const addExpenseModal     = document.getElementById("addExpenseModal");
    const addVaccinationModal = document.getElementById("addVaccinationModal");
    const pigDetailsModal     = document.getElementById("pigDetailsModal");
    const pigDetailsFrame     = document.getElementById("pigDetailsFrame");
    const notificationModal   = document.getElementById("notificationModal");     // optional
    const editPigDetailsModal = document.getElementById("editPigDetailsModal");   // NEW
    const deletePigConfirmModal = document.getElementById("deletePigConfirmModal");

    // Close buttons
    const closeAddPigModalBtn         = document.getElementById("closeAddPigModal");
    const closeWeightModalBtn         = document.getElementById("closeWeightModal");
    const closeEditWeightBtn          = document.getElementById("closeEditWeightModal");
    const closeDetailsBtn             = document.getElementById("closeDetailsModal");
    const closeExpenseModalBtn        = document.getElementById("closeExpenseModal");
    const closeVaccinationModalBtn    = document.getElementById("closeVaccinationModal");
    const closeEditPigDetailsModalBtn = document.getElementById("closeEditPigDetailsModal"); // NEW
    const closeDeletePigConfirmModalBtn = document.getElementById('closeDeletePigConfirmModal');

    // Forms
    const addPigForm         = document.getElementById("addPigForm");
    const addWeightForm      = document.getElementById("addWeightForm");
    const editWeightForm     = document.getElementById("editWeightForm");
    const addExpenseForm     = document.getElementById("addExpenseForm");
    const addVaccinationForm = document.getElementById("addVaccinationForm");
    const editPigDetailsForm = document.getElementById("editPigDetailsForm"); // NEW

    // Disable native browser constraint validation — we validate on submit in JS
    [addPigForm, addWeightForm, editWeightForm, addExpenseForm, addVaccinationForm, editPigDetailsForm].forEach(f => { if (f) f.noValidate = true; });

    // Delete pig confirm controls
    const confirmDeletePigBtn = document.getElementById('confirmDeletePig');
    const cancelDeletePigBtn  = document.getElementById('cancelDeletePig');
    const confirmDeletePigInput = document.getElementById('confirmDeletePigInput');

    // File inputs for weight
    const newWeightImgInput   = document.getElementById("newWeightImg");
    const fileNameDisplay     = document.getElementById("fileNameDisplay");
    const editWeightImgInput  = document.getElementById("editWeightImg");
    const editFileNameDisplay = document.getElementById("editFileNameDisplay");

    // Clear buttons
    const clearAddPigFormBtn         = document.getElementById("clearAddPigForm");
    const clearWeightFormBtn         = document.getElementById("clearWeightForm");
    const clearEditWeightFormBtn     = document.getElementById("clearEditWeightForm");
    const clearExpenseFormBtn        = document.getElementById("clearExpenseForm");
    const clearVaccinationFormBtn    = document.getElementById("clearVaccinationForm");
    const clearEditPigDetailsFormBtn = document.getElementById("clearEditPigDetailsForm"); // NEW

    // Farm rename/delete UI
    const renameFarmModal = document.getElementById('renameFarmModal');
    const renameFarmForm = document.getElementById('renameFarmForm');
    const newFarmNameInput = document.getElementById('newFarmName');
    const cancelRenameFarmBtn = document.getElementById('cancelRenameFarm');
    const closeRenameFarmModalBtn = document.getElementById('closeRenameFarmModal');
    const btnRenameModalDeleteFarm = document.getElementById('btnRenameModalDeleteFarm');
    const deleteFarmConfirmModal = document.getElementById('deleteFarmConfirmModal');
    const closeDeleteFarmConfirmModalBtn = document.getElementById('closeDeleteFarmConfirmModal');
    const cancelDeleteFarmBtn = document.getElementById('cancelDeleteFarm');
    const confirmDeleteFarmBtn = document.getElementById('confirmDeleteFarm');
    const deleteFarmConfirmText = document.getElementById('deleteFarmConfirmText');

    // Farm tab actions modal
    const farmTabActionsModal = document.getElementById('farmTabActionsModal');
    const closeFarmTabActionsModalBtn = document.getElementById('closeFarmTabActionsModal');
    const farmTabRenameBtn = document.getElementById('farmTabRenameBtn');
    const farmTabDeleteBtn = document.getElementById('farmTabDeleteBtn');

    // =========================================================================
    // 🔔 ALERT MODAL ELEMENTS + HELPER
    // =========================================================================
    const alertModal   = document.getElementById("alertModal");
    const alertMessage = document.getElementById("alertMessage");
    const alertIcon    = document.getElementById("alertIcon");
    const alertOkBtn   = document.getElementById("alertOkBtn");

    function showAlert(type, message, showUndo, undoCallback) {
        if (!alertModal) {
            window.alert(message);
            return;
        }

        alertModal.classList.remove("alert-success", "alert-error", "alert-warning", "alert-info");

        let iconClass = "fa-check";

        switch (type) {
            case "error":
                alertModal.classList.add("alert-error");
                iconClass = "fa-xmark";
                break;
            case "warning":
                alertModal.classList.add("alert-warning");
                iconClass = "fa-exclamation";
                break;
            case "info":
                alertModal.classList.add("alert-info");
                iconClass = "fa-circle-info";
                break;
            default:
                alertModal.classList.add("alert-success");
                iconClass = "fa-check";
        }

        alertIcon.className = "fa-solid " + iconClass;
        alertMessage.textContent = message || "";

        // Handle undo button
        const undoBtn = document.getElementById("alertUndoBtn");
        let autoCloseTimer = null;
        if (undoBtn) {
            if (showUndo && undoCallback) {
                undoBtn.style.display = "block";
                undoBtn.onclick = function () {
                    // cancel any auto-close
                    if (autoCloseTimer) clearTimeout(autoCloseTimer);
                    undoCallback();
                    alertModal.style.display = "none";
                    document.body.style.overflow = "auto";
                };
            } else {
                undoBtn.style.display = "none";
            }
        }

        alertModal.style.display = "flex";
        document.body.style.overflow = "hidden";

        // Optional auto-close: the function accepts a 5th parameter `autoCloseMs` when called.
        // If present, auto-close the alert after that many milliseconds (and hide undo).
        try {
            const args = Array.from(arguments);
            const autoCloseMs = args[4];
            if (autoCloseMs && typeof autoCloseMs === 'number' && autoCloseMs > 0) {
                autoCloseTimer = setTimeout(() => {
                    if (alertModal) {
                        alertModal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                    if (undoBtn) undoBtn.style.display = 'none';
                }, autoCloseMs);
            }
        } catch (e) {
            // ignore
        }
    }

    if (alertOkBtn) {
        alertOkBtn.addEventListener("click", () => {
            alertModal.style.display = "none";
            document.body.style.overflow = "auto";
        });
    }

    if (alertModal) {
        alertModal.addEventListener("click", (e) => {
            if (e.target === alertModal) {
                alertModal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
    }

    // =========================================================================
    // 🛠️ MODAL HELPERS
    // =========================================================================

    function closeAllModals() {
        [
            addPigModal,
            addWeightModal,
            editWeightModal,
            addExpenseModal,
            addVaccinationModal,
            pigDetailsModal,
            notificationModal,
            editPigDetailsModal
        ].forEach(modal => {
            if (modal) modal.style.display = "none";
        });

        if (pigDetailsFrame) pigDetailsFrame.src = "";
        document.body.style.overflow = "auto";
    }

    function openNotificationModal() {
        if (!notificationModal) return;
        notificationModal.style.display = "block";
        document.body.style.overflow = "hidden";
    }

    // =========================================================================
    // 🌾 FARM MANAGEMENT
    // =========================================================================

    function addNewFarm() {
        const newFarm = {
            id:   nextFarmId,
            name: `Farm ${nextFarmId}`,
            pigs: []
        };

        farms.push(newFarm);

        const newTab = document.createElement("button");
        newTab.className = "tab";
        newTab.setAttribute("role", "tab");
        newTab.setAttribute("aria-selected", "false");
        newTab.setAttribute("data-farm", newFarm.id);
        newTab.textContent = newFarm.name;

        tabsContainer.insertBefore(newTab, tabAdd);

        newTab.addEventListener("click", () => switchToFarm(newFarm.id));
        // double-click should open the rename/delete UI for this new farm
        newTab.addEventListener('dblclick', function (e) { showTabActionsDropdown(this, newFarm.id); e.stopPropagation(); });

        switchToFarm(newFarm.id);
        nextFarmId++;
    }

    function switchToFarm(farmId) {
        // Use a live query so dynamically added tabs are included
        const allTabs = document.querySelectorAll('.tab');
        allTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });

            const currentTab = document.querySelector(`.tab[data-farm="${farmId}"]`);
            if (currentTab) {
                currentTab.classList.add('active');
                currentTab.setAttribute('aria-selected', 'true');
            }

        currentFarmId = farmId;
        loadFarmData();
    }

    // =========================================================================
    // 🐷 PIG MANAGEMENT (LIST VIEW)
    // =========================================================================

    function openAddPigModal() {
        if (!addPigModal) return;

        addPigModal.style.display = "flex";
        document.body.style.overflow = "hidden";

        const pigDateInput = document.getElementById("pigDate");
        const pigNameInput = document.getElementById("pigName");

        // Clear inputs - let user choose the date they acquired the pig
        if (pigDateInput) pigDateInput.value = "";
        if (pigNameInput) pigNameInput.focus();
    }

    function addNewPig(pigData) {
        const currentFarm = getCurrentFarm();
        if (!currentFarm) return;

        const initialWeight = parseFloat(pigData.initialWeight);

        const newPig = {
            id:     nextPigId,
            name:   pigData.name,
            breed:  pigData.breed,
            gender: pigData.gender,
            age:    pigData.age, // raw months (string from select)
            date:   pigData.date,

            shortId: pigData.name.substring(0, 3).toUpperCase(),
            weight:  `${initialWeight}kg`,
            status:  "growing",

            weightHistory: [{
                date:   pigData.date,
                weight: initialWeight,
                img:    "Dash Icons/WPig.png"
            }],

            expenses:      [],
            vaccinations:  [],
            statusHistory: [{
                date:   pigData.date,
                status: "growing",
                notes:  "Initial registration."
            }]
        };

        currentFarm.pigs.push(newPig);
        nextPigId++;

        loadFarmData();
    }


        function createPigRow(pig) {
        const row        = document.createElement("tr");
        const isInactive = pig.status === "sold" || pig.status === "deceased";

        row.className      = `pig-row ${isInactive ? "inactive" : ""}`;
        row.dataset.id     = pig.id;
        row.dataset.status = pig.status;

        const ageDisplay = pig.age ? `${pig.age} mo.` : "-";

        row.innerHTML = `
            <td class="col-checkbox">
                <input 
                    type="checkbox" 
                    class="pig-checkbox" 
                    data-pig-id="${pig.id}" 
                    ${isInactive ? "disabled" : ""}>
            </td>
            <td class="col-name">
                <span 
                    class="pig-id-badge clickable-badge" 
                    onclick="openPigDetails(${pig.id}, ${currentFarmId})">
                    ${pig.shortId}
                </span>
            </td>
            <td class="col-age">${ageDisplay}</td>
            <td class="col-weight">${pig.weight}</td>
            <td class="col-gender">
                <i class="fa-solid fa-${pig.gender === "female" ? "venus" : "mars"} gender-icon ${pig.gender}"></i>
                ${pig.gender === "female" ? "Female" : "Male"}
            </td>
            <td class="col-status">
                <span class="status-badge status-${pig.status}">${formatStatusText(pig.status)}</span>
            </td>
        `;

        return row;
    }

    function loadFarmData() {
        const currentFarm = getCurrentFarm();
        if (!currentFarm || !pigsTableBody) return;

        pigsTableBody.innerHTML = "";

        if (currentFarm.pigs.length === 0) {
            pigsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-farm">
                        <div class="empty-farm-message">No pigs added yet.</div>
                    </td>
                </tr>
            `;
        } else {
            currentFarm.pigs.forEach(pig => {
                const row = createPigRow(pig);
                pigsTableBody.appendChild(row);
            });
        }

        pigCheckboxes = document.querySelectorAll(".pig-checkbox");
        pigRows       = document.querySelectorAll(".pig-row");

        setupSelectAllCheckbox(selectAllCheckbox,      pigCheckboxes);
        setupSelectAllCheckbox(tableSelectAllCheckbox, pigCheckboxes);

        updatePigCounts();
        updateFilterCounts();
    }

    // =========================================================================
    // ➕ ADD / EDIT WEIGHT MODALS
    // =========================================================================

    if (addWeightForm) {
        addWeightForm.addEventListener("submit", function (e) {
            e.preventDefault();

            clearFormErrors(this);

            const dateInputEl = document.getElementById("newWeightDate");
            const weightInputEl = document.getElementById("newWeightValue");
            const dateVal = dateInputEl ? dateInputEl.value : '';
            const weightVal = weightInputEl ? weightInputEl.value : '';

            let hasError = false;

            // Date validation
            if (!dateVal) {
                const wrapper = getWrapperForField(dateInputEl);
                const err = getOrCreateErrorEl(wrapper) || wrapper && wrapper.querySelector('.date-error');
                if (err) { err.textContent = 'Please select a date.'; err.style.display = 'block'; }
                hasError = true;
            } else {
                // Allow recent past (weeks/months) but not very old dates, and disallow future dates
                const picked = new Date(dateVal + 'T00:00:00');
                const today = new Date();
                today.setHours(0,0,0,0);
                if (picked > today) {
                    const wrapper = getWrapperForField(dateInputEl);
                    const err = getOrCreateErrorEl(wrapper) || wrapper && wrapper.querySelector('.date-error');
                    if (err) { err.textContent = 'Date cannot be in the future.'; err.style.display = 'block'; }
                    hasError = true;
                } else if (isDateOlderThanMonths(dateVal, 6)) {
                    const wrapper = getWrapperForField(dateInputEl);
                    const err = getOrCreateErrorEl(wrapper) || wrapper && wrapper.querySelector('.date-error');
                    if (err) { err.textContent = 'Date is too old — please choose a date within the last 6 months.'; err.style.display = 'block'; }
                    hasError = true;
                }
            }

            // Weight validation
            if (!weightVal) {
                const wrapper = getWrapperForField(weightInputEl);
                const err = getOrCreateErrorEl(wrapper);
                if (err) { err.textContent = 'Please enter a weight.'; err.style.display = 'block'; }
                hasError = true;
            } else if (!isValidWeightValue(weightVal)) {
                const wrapper = getWrapperForField(weightInputEl);
                const err = getOrCreateErrorEl(wrapper);
                if (err) { err.textContent = 'Please enter a believable weight (1–120 kg).'; err.style.display = 'block'; }
                hasError = true;
            }

            if (hasError) return;

            const farm = currentDetailFarmId
                ? getFarmById(currentDetailFarmId)
                : getCurrentFarm();
            if (!farm) {
                showAlert("error", "Error: Farm not found.");
                return;
            }

            const pig = farm.pigs.find(p => p.id === currentDetailPigId);
            if (!pig) {
                showAlert("error", "Error: Pig not found.");
                if (addWeightModal) addWeightModal.style.display = "none";
                document.body.style.overflow = "auto";
                return;
            }

            const imgFile = newWeightImgInput?.files?.[0];
            const newRecord = {
                date:   dateVal,
                weight: parseFloat(weightVal),
                img:    imgFile ? URL.createObjectURL(imgFile) : "Dash Icons/WPig.png"
            };

            if (!Array.isArray(pig.weightHistory)) {
                pig.weightHistory = [];
            }

            // Check if editing or adding
            if (currentEditWeightRecordIndex !== null && pig.weightHistory[currentEditWeightRecordIndex]) {
                // UPDATE existing record
                pig.weightHistory[currentEditWeightRecordIndex] = newRecord;
                showAlert("success", "Weight record updated successfully!");
            } else {
                // ADD new record
                pig.weightHistory.push(newRecord);
                showAlert("success", "Weight record added successfully!");
            }

            pig.weight = `${weightVal}kg`;

            if (addWeightModal) addWeightModal.style.display = "none";

            // Re-open details modal & refresh iframe with correct pig/farm IDs
            if (pigDetailsModal) pigDetailsModal.style.display = "flex";
            if (pigDetailsFrame && currentDetailPigId && currentDetailFarmId) {
                const refreshUrl = `pig-details.html?id=${encodeURIComponent(currentDetailPigId)}&farm=${encodeURIComponent(currentDetailFarmId)}`;
                
                // Set up postMessage to send updated pig data once iframe reloads
                const onFrameReload = function () {
                    try {
                        const updatedPig = window.getPigDataById(currentDetailPigId, currentDetailFarmId);
                        if (updatedPig && pigDetailsFrame.contentWindow) {
                            pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
                        }
                    } catch (err) {
                        console.warn("Failed to postMessage updated pig data:", err);
                    } finally {
                        pigDetailsFrame.removeEventListener("load", onFrameReload);
                    }
                };
                
                pigDetailsFrame.addEventListener("load", onFrameReload);
                pigDetailsFrame.src = refreshUrl; // reload with correct pig
            }

            loadFarmData();
            this.reset();

            // Reset edit mode
            currentEditWeightRecordIndex = null;

            // Don't auto-fill date - let user choose when they use the form again
            if (fileNameDisplay) {
                fileNameDisplay.textContent      = "Upload Image";
                fileNameDisplay.style.color      = "var(--text-light)";
                fileNameDisplay.style.fontStyle  = "italic";
            }
        });
    }

    if (clearWeightFormBtn && addWeightForm) {
        clearWeightFormBtn.addEventListener("click", function () {
            addWeightForm.reset();
            // Clear date input completely - let user choose when they want to add a record
            const dateInput = document.getElementById("newWeightDate");
            if (dateInput) dateInput.value = "";

            if (fileNameDisplay) {
                fileNameDisplay.textContent      = "Upload Image";
                fileNameDisplay.style.color      = "var(--text-light)";
                fileNameDisplay.style.fontStyle  = "italic";
            }
        });
    }

    // (Edit weight logic kept optional; safe if edit modal not present)
    if (editWeightForm) {
        editWeightForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const dateVal   = document.getElementById("editWeightDate")?.value;
            const weightVal = document.getElementById("editWeightValue")?.value;

            if (!dateVal || !weightVal) {
                showAlert("warning", "Please enter a date and weight.");
                return;
            }

            const farm = currentDetailFarmId
                ? getFarmById(currentDetailFarmId)
                : getCurrentFarm();
            if (!farm) {
                showAlert("error", "Error: Farm not found.");
                return;
            }

            const pig = farm.pigs.find(p => p.id === currentDetailPigId);
            if (!pig || currentEditWeightRecordIndex === null) {
                showAlert("error", "Error: Could not save changes.");
                currentEditWeightRecordIndex = null;
                return;
            }

            const editedRecord = pig.weightHistory[currentEditWeightRecordIndex];
            editedRecord.date   = dateVal;
            editedRecord.weight = parseFloat(weightVal);

            const imgFile = editWeightImgInput?.files?.[0];
            if (imgFile) {
                editedRecord.img = URL.createObjectURL(imgFile);
            }

            // If editing most recent record, update display weight
            if (currentEditWeightRecordIndex === pig.weightHistory.length - 1) {
                pig.weight = `${weightVal}kg`;
            }

            if (editWeightModal) editWeightModal.style.display = "none";
            if (pigDetailsModal && pigDetailsFrame && currentDetailPigId && currentDetailFarmId) {
                pigDetailsModal.style.display = "flex";
                const refreshUrl = `pig-details.html?id=${encodeURIComponent(currentDetailPigId)}&farm=${encodeURIComponent(currentDetailFarmId)}`;
                
                // Set up postMessage to send updated pig data once iframe reloads
                const onFrameReload = function () {
                    try {
                        const updatedPig = window.getPigDataById(currentDetailPigId, currentDetailFarmId);
                        if (updatedPig && pigDetailsFrame.contentWindow) {
                            pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
                        }
                    } catch (err) {
                        console.warn("Failed to postMessage updated pig data:", err);
                    } finally {
                        pigDetailsFrame.removeEventListener("load", onFrameReload);
                    }
                };
                
                pigDetailsFrame.addEventListener("load", onFrameReload);
                pigDetailsFrame.src = refreshUrl;
            } else {
                document.body.style.overflow = "auto";
            }

            loadFarmData();
            this.reset();
            currentEditWeightRecordIndex = null;

            showAlert("success", "Weight record updated successfully!");
        });
    }

    if (clearEditWeightFormBtn && editWeightForm) {
        clearEditWeightFormBtn.addEventListener("click", function () {
            editWeightForm.reset();
            if (editFileNameDisplay) {
                editFileNameDisplay.textContent      = "Upload Image";
                editFileNameDisplay.style.color      = "var(--text-light)";
                editFileNameDisplay.style.fontStyle  = "italic";
            }
        });
    }

    // =========================================================================
    // 📄 ADD PIG FORM HANDLER
    // =========================================================================

    if (addPigForm) {
        addPigForm.addEventListener("submit", function (e) {
            e.preventDefault();

            clearFormErrors(this);

            const nameEl = document.getElementById("pigName");
            const breedEl = document.getElementById("pigBreed");
            const genderEl = document.getElementById("pigGender");
            const ageEl = document.getElementById("pigAge");
            const dateEl = document.getElementById("pigDate");
            const weightEl = document.getElementById("pigWeight");

            const name = nameEl ? nameEl.value.trim() : '';
            const breed = breedEl ? breedEl.value : '';
            const gender = genderEl ? genderEl.value : '';
            const age = ageEl ? ageEl.value : '';
            const date = dateEl ? dateEl.value : '';
            const weight = weightEl ? weightEl.value : '';

            let hasError = false;

            if (!name) {
                const w = getWrapperForField(nameEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please enter a name or ID.'; err.style.display = 'block'; }
                hasError = true;
            }
            if (!breed) {
                const w = getWrapperForField(breedEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please select a breed.'; err.style.display = 'block'; }
                hasError = true;
            }
            if (!gender) {
                const w = getWrapperForField(genderEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please select a gender.'; err.style.display = 'block'; }
                hasError = true;
            }
            if (!age) {
                const w = getWrapperForField(ageEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please select an age.'; err.style.display = 'block'; }
                hasError = true;
            }
            if (!date) {
                const w = getWrapperForField(dateEl);
                const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                if (err) { err.textContent = 'Please select a date acquired.'; err.style.display = 'block'; }
                hasError = true;
            } else {
                const picked = new Date(date + 'T00:00:00');
                const today = new Date();
                today.setHours(0,0,0,0);
                if (picked > today) {
                    const w = getWrapperForField(dateEl);
                    const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                    if (err) { err.textContent = 'Date acquired cannot be in the future.'; err.style.display = 'block'; }
                    hasError = true;
                } else if (isDateTooOld(date)) {
                    const w = getWrapperForField(dateEl);
                    const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                    if (err) { err.textContent = 'Date acquired is too old — choose within past year.'; err.style.display = 'block'; }
                    hasError = true;
                }
            }
            if (!weight) {
                const w = getWrapperForField(weightEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please enter an initial weight.'; err.style.display = 'block'; }
                hasError = true;
            } else if (!isValidWeightValue(weight)) {
                const w = getWrapperForField(weightEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please enter a believable weight (1–120 kg).'; err.style.display = 'block'; }
                hasError = true;
            }

            if (hasError) {
                // focus the first invalid field for better UX
                const firstFieldError = this.querySelector('.field-error, .date-error');
                if (firstFieldError) {
                    // try to focus associated input/select inside the same wrapper
                    const wrapper = firstFieldError.closest('.input-wrapper') || firstFieldError.parentElement;
                    if (wrapper) {
                        const input = wrapper.querySelector('input, select, textarea');
                        if (input) {
                            try { input.focus(); } catch (e) {}
                        }
                    }
                }
                return;
            }

            const pigData = {
                name,
                breed,
                gender,
                age,
                date,
                initialWeight: weight
            };

            addNewPig(pigData);
            addPigForm.reset();
            closeAllModals();

            showAlert("success", "Pig added successfully!");
        });
    }

    if (clearAddPigFormBtn && addPigForm) {
        clearAddPigFormBtn.addEventListener("click", function () {
            addPigForm.reset();
            const pigDateInput = document.getElementById("pigDate");
            if (pigDateInput) pigDateInput.value = "";
        });
    }

    // =========================================================================
    // ✏️ EDIT PIG DETAILS FORM HANDLER (NEW)
    // =========================================================================

    if (editPigDetailsForm) {
        editPigDetailsForm.addEventListener("submit", function (e) {
            e.preventDefault();

            clearFormErrors(this);

            const nameEl = document.getElementById("editPigName");
            const breedEl = document.getElementById("editPigBreed");
            const genderEl = document.getElementById("editPigGender");
            const ageEl = document.getElementById("editPigAge");
            const dateEl = document.getElementById("editPigDate");

            const nameVal   = nameEl ? nameEl.value.trim() : '';
            const breedVal  = breedEl ? breedEl.value : '';
            const genderVal = genderEl ? genderEl.value : '';
            const ageVal    = ageEl ? ageEl.value : '';
            const dateVal   = dateEl ? dateEl.value : '';

            let hasError = false;

            if (!nameVal) {
                const w = getWrapperForField(nameEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please enter a pig name or ID.'; err.style.display = 'block'; }
                hasError = true;
            }
            if (!breedVal) {
                const w = getWrapperForField(breedEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please select a breed.'; err.style.display = 'block'; }
                hasError = true;
            }
            if (!genderVal) {
                const w = getWrapperForField(genderEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please select a gender.'; err.style.display = 'block'; }
                hasError = true;
            }
            if (!ageVal) {
                const w = getWrapperForField(ageEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please select an age.'; err.style.display = 'block'; }
                hasError = true;
            }

            // Date: not future, and not too old (keep previous one-year limit)
            if (!dateVal) {
                const w = getWrapperForField(dateEl);
                const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                if (err) { err.textContent = 'Please select a date.'; err.style.display = 'block'; }
                hasError = true;
            } else {
                const picked = new Date(dateVal + 'T00:00:00');
                const today = new Date();
                today.setHours(0,0,0,0);
                if (picked > today) {
                    const w = getWrapperForField(dateEl);
                    const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                    if (err) { err.textContent = 'Date cannot be in the future.'; err.style.display = 'block'; }
                    hasError = true;
                } else if (isDateTooOld(dateVal)) {
                    const w = getWrapperForField(dateEl);
                    const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                    if (err) { err.textContent = 'Date is too old — please choose a date within the past year.'; err.style.display = 'block'; }
                    hasError = true;
                }
            }

            if (hasError) {
                const firstFieldError = this.querySelector('.field-error, .date-error');
                if (firstFieldError) {
                    const wrapper = firstFieldError.closest('.input-wrapper') || firstFieldError.parentElement;
                    if (wrapper) {
                        const input = wrapper.querySelector('input, select, textarea');
                        if (input) try { input.focus(); } catch(e) {}
                    }
                }
                return;
            }

            const farm = currentDetailFarmId
                ? getFarmById(currentDetailFarmId)
                : getCurrentFarm();
            if (!farm) {
                showAlert("error", "Error: Farm not found.");
                return;
            }

            const pig = farm.pigs.find(p => p.id === currentDetailPigId);
            if (!pig) {
                showAlert("error", "Error: Pig not found.");
                return;
            }

            pig.name    = nameVal;
            pig.breed   = breedVal;
            pig.gender  = genderVal;
            pig.age     = ageVal;
            pig.date    = dateVal;
            pig.shortId = nameVal.substring(0, 3).toUpperCase();

            if (editPigDetailsModal) editPigDetailsModal.style.display = "none";

            if (pigDetailsModal && pigDetailsFrame && currentDetailPigId && currentDetailFarmId) {
                pigDetailsModal.style.display = "flex";
                const refreshUrl = `pig-details.html?id=${encodeURIComponent(currentDetailPigId)}&farm=${encodeURIComponent(currentDetailFarmId)}`;
                
                // Set up postMessage to send updated pig data once iframe reloads
                const onFrameReload = function () {
                    try {
                        const updatedPig = window.getPigDataById(currentDetailPigId, currentDetailFarmId);
                        if (updatedPig && pigDetailsFrame.contentWindow) {
                            pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
                        }
                    } catch (err) {
                        console.warn("Failed to postMessage updated pig data:", err);
                    } finally {
                        pigDetailsFrame.removeEventListener("load", onFrameReload);
                    }
                };

                pigDetailsFrame.addEventListener("load", onFrameReload);
                
                // Reload the iframe with the updated pig data
                pigDetailsFrame.src = refreshUrl;
            } else {
                document.body.style.overflow = "auto";
            }

            loadFarmData();
            this.reset();

            showAlert("success", "Pig details updated successfully!");
        });
    }

    if (clearEditPigDetailsFormBtn && editPigDetailsForm) {
        clearEditPigDetailsFormBtn.addEventListener("click", function () {
            editPigDetailsForm.reset();
        });
    }

    // =========================================================================
    // ➕ ADD EXPENSE MODAL
    // =========================================================================

    if (addExpenseForm) {
        addExpenseForm.addEventListener("submit", function (e) {
            e.preventDefault();

            clearFormErrors(this);

            const dateInputEl = document.getElementById("expenseDate");
            const priceInputEl = document.getElementById("expensePrice");
            const categoryEl = document.getElementById("expenseCategory");

            const dateVal = dateInputEl ? dateInputEl.value : '';
            const priceVal = priceInputEl ? priceInputEl.value : '';
            const categoryVal = categoryEl ? categoryEl.value : '';

            let hasError = false;
            if (!dateVal) {
                const wrapper = getWrapperForField(dateInputEl);
                const err = getOrCreateErrorEl(wrapper) || wrapper && wrapper.querySelector('.date-error');
                if (err) { err.textContent = 'Please select a date.'; err.style.display = 'block'; }
                hasError = true;
            } else if (isDateTooOld(dateVal)) {
                const wrapper = getWrapperForField(dateInputEl);
                const err = getOrCreateErrorEl(wrapper) || wrapper && wrapper.querySelector('.date-error');
                if (err) { err.textContent = 'Date is too old — please choose a date within the past year.'; err.style.display = 'block'; }
                hasError = true;
            }

            if (!priceVal) {
                const wrapper = getWrapperForField(priceInputEl);
                const err = getOrCreateErrorEl(wrapper);
                if (err) { err.textContent = 'Please enter a price.'; err.style.display = 'block'; }
                hasError = true;
            }

            if (!categoryVal) {
                const wrapper = getWrapperForField(categoryEl);
                const err = getOrCreateErrorEl(wrapper);
                if (err) { err.textContent = 'Please select a category.'; err.style.display = 'block'; }
                hasError = true;
            }

            if (hasError) return;

            const farm = currentDetailFarmId
                ? getFarmById(currentDetailFarmId)
                : getCurrentFarm();
            if (!farm) {
                showAlert("error", "Error: Farm not found.");
                return;
            }

            const pig = farm.pigs.find(p => p.id === currentDetailPigId);
            if (!pig) {
                showAlert("error", "Error: Pig not found.");
                if (addExpenseModal) addExpenseModal.style.display = "none";
                document.body.style.overflow = "auto";
                return;
            }

            if (!Array.isArray(pig.expenses)) pig.expenses = [];

            const newExpense = {
                date:     dateVal,
                price:    parseFloat(priceVal),
                category: categoryVal
            };

            // Check if editing or adding
            if (currentEditExpenseIndex !== null && pig.expenses[currentEditExpenseIndex]) {
                // UPDATE existing record
                pig.expenses[currentEditExpenseIndex] = newExpense;
                showAlert("success", "Expense record updated successfully!");
            } else {
                // ADD new record
                pig.expenses.push(newExpense);
                showAlert("success", "Expense record added successfully!");
            }

            if (addExpenseModal) addExpenseModal.style.display = "none";

            if (pigDetailsModal) pigDetailsModal.style.display = "flex";
            if (pigDetailsFrame && currentDetailPigId && currentDetailFarmId) {
                const refreshUrl = `pig-details.html?id=${encodeURIComponent(currentDetailPigId)}&farm=${encodeURIComponent(currentDetailFarmId)}`;
                
                // Set up postMessage to send updated pig data once iframe reloads
                const onFrameReload = function () {
                    try {
                        const updatedPig = window.getPigDataById(currentDetailPigId, currentDetailFarmId);
                        if (updatedPig && pigDetailsFrame.contentWindow) {
                            pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
                        }
                    } catch (err) {
                        console.warn("Failed to postMessage updated pig data:", err);
                    } finally {
                        pigDetailsFrame.removeEventListener("load", onFrameReload);
                    }
                };
                
                pigDetailsFrame.addEventListener("load", onFrameReload);
                pigDetailsFrame.src = refreshUrl;
            }

            loadFarmData();
            this.reset();

            // Reset edit mode
            currentEditExpenseIndex = null;

            const dateInput = document.getElementById("expenseDate");
            if (dateInput) dateInput.value = ""; // Clear date - let user choose when they use the form again
        });
    }

    if (clearExpenseFormBtn && addExpenseForm) {
        clearExpenseFormBtn.addEventListener("click", function () {
            addExpenseForm.reset();
            const dateInput = document.getElementById("expenseDate");
            if (dateInput) dateInput.value = ""; // Clear date input completely
        });
    }

    // =========================================================================
    // ➕ ADD VACCINATION MODAL
    // =========================================================================

    if (addVaccinationForm) {
        addVaccinationForm.addEventListener("submit", function (e) {
            e.preventDefault();

            clearFormErrors(this);

            const dateEl = document.getElementById("vaccDate");
            const dueEl  = document.getElementById("vaccDueDate");
            const typeEl = document.getElementById("vaccType");

            const dateVal = dateEl ? dateEl.value : '';
            const dueDateVal = dueEl ? dueEl.value : '';
            const typeVal = typeEl ? typeEl.value : '';

            let hasError = false;

            if (!dateVal) {
                const w = getWrapperForField(dateEl);
                const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                if (err) { err.textContent = 'Please select a vaccination date.'; err.style.display = 'block'; }
                hasError = true;
            } else {
                // vaccination date: must not be future and should be reasonably recent (<= 6 months)
                const picked = new Date(dateVal + 'T00:00:00');
                const today = new Date();
                today.setHours(0,0,0,0);
                if (picked > today) {
                    const w = getWrapperForField(dateEl);
                    const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                    if (err) { err.textContent = 'Vaccination date cannot be in the future.'; err.style.display = 'block'; }
                    hasError = true;
                } else if (isDateOlderThanMonths(dateVal, 6)) {
                    const w = getWrapperForField(dateEl);
                    const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                    if (err) { err.textContent = 'Vaccination date is too old — please choose within the last 6 months.'; err.style.display = 'block'; }
                    hasError = true;
                }
            }

            if (!dueDateVal) {
                const w = getWrapperForField(dueEl);
                const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                if (err) { err.textContent = 'Please select a due date.'; err.style.display = 'block'; }
                hasError = true;
            } else {
                // due date may be in the future, but must not be earlier than vacc date
                if (dateVal) {
                    const d1 = new Date(dateVal + 'T00:00:00');
                    const d2 = new Date(dueDateVal + 'T00:00:00');
                    if (d2 < d1) {
                        const w = getWrapperForField(dueEl);
                        const err = getOrCreateErrorEl(w) || w && w.querySelector('.date-error');
                        if (err) { err.textContent = 'Due date cannot be earlier than vaccination date.'; err.style.display = 'block'; }
                        hasError = true;
                    }
                }
            }

            if (!typeVal) {
                const w = getWrapperForField(typeEl);
                const err = getOrCreateErrorEl(w);
                if (err) { err.textContent = 'Please select a vaccination type.'; err.style.display = 'block'; }
                hasError = true;
            }

            if (hasError) return;

            const farm = currentDetailFarmId
                ? getFarmById(currentDetailFarmId)
                : getCurrentFarm();
            if (!farm) {
                showAlert("error", "Error: Farm not found.");
                return;
            }

            const pig = farm.pigs.find(p => p.id === currentDetailPigId);
            if (!pig) {
                showAlert("error", "Error: Pig not found.");
                if (addVaccinationModal) addVaccinationModal.style.display = "none";
                document.body.style.overflow = "auto";
                return;
            }

            if (!Array.isArray(pig.vaccinations)) pig.vaccinations = [];

            const newVaccination = {
                date:    dateVal,
                dueDate: dueDateVal,
                type:    typeVal,
                status:  "scheduled"
            };

            // Check if editing or adding
            if (currentEditVaccinationIndex !== null && pig.vaccinations[currentEditVaccinationIndex]) {
                // UPDATE existing record
                pig.vaccinations[currentEditVaccinationIndex] = newVaccination;
                showAlert("success", "Vaccination record updated successfully!");
            } else {
                // ADD new record
                pig.vaccinations.push(newVaccination);
                showAlert("success", "Vaccination record added successfully!");
            }

            if (addVaccinationModal) addVaccinationModal.style.display = "none";

            if (pigDetailsModal) pigDetailsModal.style.display = "flex";
            if (pigDetailsFrame && currentDetailPigId && currentDetailFarmId) {
                const refreshUrl = `pig-details.html?id=${encodeURIComponent(currentDetailPigId)}&farm=${encodeURIComponent(currentDetailFarmId)}`;
                
                // Set up postMessage to send updated pig data once iframe reloads
                const onFrameReload = function () {
                    try {
                        const updatedPig = window.getPigDataById(currentDetailPigId, currentDetailFarmId);
                        if (updatedPig && pigDetailsFrame.contentWindow) {
                            pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
                        }
                    } catch (err) {
                        console.warn("Failed to postMessage updated pig data:", err);
                    } finally {
                        pigDetailsFrame.removeEventListener("load", onFrameReload);
                    }
                };
                
                pigDetailsFrame.addEventListener("load", onFrameReload);
                pigDetailsFrame.src = refreshUrl;
            }

            loadFarmData();
            this.reset();

            // Reset edit mode
            currentEditVaccinationIndex = null;

            const vaccDate = document.getElementById("vaccDate");
            if (vaccDate) vaccDate.value = ""; // Clear date - let user choose when they use the form again
        });
    }

    if (clearVaccinationFormBtn && addVaccinationForm) {
        clearVaccinationFormBtn.addEventListener("click", function () {
            addVaccinationForm.reset();
            const vaccDate    = document.getElementById("vaccDate");
            const vaccDueDate = document.getElementById("vaccDueDate");
            if (vaccDate)    vaccDate.value    = ""; // Clear both dates
            if (vaccDueDate) vaccDueDate.value = "";
        });
    }

    // =========================================================================
    // 🧩 GENERIC MODAL & FILE INPUT EVENTS
    // =========================================================================

    if (closeAddPigModalBtn) {
        closeAddPigModalBtn.addEventListener("click", closeAllModals);
    }

    if (closeWeightModalBtn) {
        closeWeightModalBtn.addEventListener("click", function () {
            if (addWeightModal) addWeightModal.style.display = "none";
            const weightHint = document.getElementById("weightHint");
            if (weightHint) {
                try { weightHint.dataset.persistent = ""; } catch(e){}
                weightHint.style.display = "none";
            }
            currentEditWeightRecordIndex = null;
            if (pigDetailsModal && pigDetailsFrame && pigDetailsFrame.src) {
                pigDetailsModal.style.display = "flex";
            } else {
                document.body.style.overflow = "auto";
            }
        });
    }

    if (closeEditWeightBtn) {
        closeEditWeightBtn.addEventListener("click", function () {
            if (editWeightModal) editWeightModal.style.display = "none";
            const weightHint = document.getElementById("weightHint");
            if (weightHint) {
                try { weightHint.dataset.persistent = ""; } catch(e){}
                weightHint.style.display = "none";
            }
            if (pigDetailsModal && pigDetailsFrame && pigDetailsFrame.src) {
                pigDetailsModal.style.display = "flex";
            } else {
                document.body.style.overflow = "auto";
            }
        });
    }

    if (closeExpenseModalBtn) {
        closeExpenseModalBtn.addEventListener("click", function () {
            if (addExpenseModal) addExpenseModal.style.display = "none";
            const expenseHint = document.getElementById("expenseHint");
            if (expenseHint) {
                try { expenseHint.dataset.persistent = ""; } catch(e){}
                expenseHint.style.display = "none";
            }
            currentEditExpenseIndex = null;
            if (pigDetailsModal && pigDetailsFrame && pigDetailsFrame.src) {
                pigDetailsModal.style.display = "flex";
            } else {
                document.body.style.overflow = "auto";
            }
        });
    }

    if (closeVaccinationModalBtn) {
        closeVaccinationModalBtn.addEventListener("click", function () {
            if (addVaccinationModal) addVaccinationModal.style.display = "none";
            if (pigDetailsModal && pigDetailsFrame && pigDetailsFrame.src) {
                pigDetailsModal.style.display = "flex";
            } else {
                document.body.style.overflow = "auto";
            }
        });
    }

    if (closeEditPigDetailsModalBtn) {
        closeEditPigDetailsModalBtn.addEventListener("click", function () {
            if (editPigDetailsModal) editPigDetailsModal.style.display = "none";
            if (pigDetailsModal && pigDetailsFrame && pigDetailsFrame.src) {
                pigDetailsModal.style.display = "flex";
            } else {
                document.body.style.overflow = "auto";
            }
        });
    }

    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener("click", closeAllModals);
    }

    // Click overlay background of any .modal to close everything
    document.addEventListener("click", function (e) {
        const target = e.target;
        if (target.classList.contains("modal")) {
            closeAllModals();
        }
    });

    // ESC to close all modals
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeAllModals();
        }
    });

    // File input display (Add weight)
    if (newWeightImgInput && fileNameDisplay) {
        newWeightImgInput.addEventListener("change", function () {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent     = this.files[0].name;
                fileNameDisplay.style.color     = "#333";
                fileNameDisplay.style.fontStyle = "normal";
            } else {
                fileNameDisplay.textContent     = "Upload Image";
                fileNameDisplay.style.color     = "var(--text-light)";
                fileNameDisplay.style.fontStyle = "italic";
            }
        });
    }

    // File input display (Edit weight)
    if (editWeightImgInput && editFileNameDisplay) {
        editWeightImgInput.addEventListener("change", function () {
            if (this.files && this.files.length > 0) {
                editFileNameDisplay.textContent     = this.files[0].name;
                editFileNameDisplay.style.color     = "#333";
                editFileNameDisplay.style.fontStyle = "normal";
            } else {
                editFileNameDisplay.textContent     = "Upload Image";
                editFileNameDisplay.style.color     = "var(--text-light)";
                editFileNameDisplay.style.fontStyle = "italic";
            }
        });
    }

    // =========================================================================
    // ✅ SELECT ALL CHECKBOXES
    // =========================================================================

    function setupSelectAllCheckbox(masterCheckbox, checkboxes) {
        if (!masterCheckbox || !checkboxes) return;

        masterCheckbox.addEventListener("change", function () {
            const isChecked = this.checked;
            checkboxes.forEach(checkbox => {
                if (!checkbox.disabled) {
                    checkbox.checked = isChecked;
                }
            });
        });

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", function () {
                if (!this.checked) {
                    masterCheckbox.checked = false;
                }

                const enabledCheckboxes = Array.from(checkboxes).filter(cb => !cb.disabled);
                const allChecked = enabledCheckboxes.length > 0 &&
                    enabledCheckboxes.every(cb => cb.checked);

                if (allChecked) {
                    masterCheckbox.checked = true;
                }
            });
        });
    }


        // =========================================================================
    // 🧽 FILTERS, STATUS CHANGE, COUNTS
    // =========================================================================

    function filterPigs(filterType) {
        const rows = document.querySelectorAll(".pig-row");
        let visibleCount = 0;

        rows.forEach(row => {
            if (filterType === "all" || row.dataset.status === filterType) {
                row.style.display = "";
                visibleCount++;
            } else {
                row.style.display = "none";
            }
        });

        updateDisplayCounts(visibleCount);
    }

    function updatePigCounts() {
        const currentFarm = getCurrentFarm();
        if (!currentFarm) return;

        const activePigs = currentFarm.pigs.filter(pig =>
            pig.status !== "sold" && pig.status !== "deceased"
        ).length;

        const totalPigs = currentFarm.pigs.length;

        if (activePigsCount) activePigsCount.textContent = activePigs;
        if (showingCount)    showingCount.textContent    = totalPigs;
        if (totalCount)      totalCount.textContent      = totalPigs;
    }

    function updateFilterCounts() {
        const currentFarm = getCurrentFarm();
        if (!currentFarm) return;

        const counts = {
            all:      currentFarm.pigs.length,
            growing:  currentFarm.pigs.filter(p => p.status === "growing").length,
            tosale:   currentFarm.pigs.filter(p => p.status === "tosale").length,
            sold:     currentFarm.pigs.filter(p => p.status === "sold").length,
            deceased: currentFarm.pigs.filter(p => p.status === "deceased").length
        };

        filterItems.forEach(item => {
            const filterType = item.dataset.filter;
            const countSpan  = item.querySelector(".filter-count");
            if (countSpan) {
                countSpan.textContent = counts[filterType] ?? 0;
            }
        });
    }

    function updateDisplayCounts(visibleCount) {
        if (showingCount) showingCount.textContent = visibleCount;
    }

    // =========================================================================
    // 🔍 SEARCH
    // =========================================================================

    function searchPigs(searchTerm) {
        const rows = document.querySelectorAll(".pig-row");
        let visibleCount = 0;

        rows.forEach(row => {
            const nameText = row.querySelector(".col-name")?.textContent.toLowerCase() || "";
            const idText   = row.querySelector(".pig-id-badge")?.textContent.toLowerCase() || "";
            const status   = row.dataset.status || "";

            const matchesSearch =
                !searchTerm ||
                nameText.includes(searchTerm) ||
                idText.includes(searchTerm) ||
                status.includes(searchTerm);

            if (matchesSearch) {
                row.style.display = "";
                visibleCount++;
            } else {
                row.style.display = "none";
            }
        });

        updateDisplayCounts(visibleCount);
    }

    // =========================================================================
    // ✨ FLOATING LABEL HELPERS (SELECT, DATE, WEIGHT)
    // =========================================================================

    // 1) SELECTS: add .has-value when an option is selected
    const selects = document.querySelectorAll(".input-wrapper select");
    selects.forEach(select => {
        const update = () => {
            if (select.value && select.value !== "") {
                select.classList.add("has-value");
            } else {
                select.classList.remove("has-value");
            }
        };
        select.addEventListener("change", update);
        update();
    });

    // 2) DATE INPUTS: add .is-focused / .has-value on the wrapper
    // Helper: open native picker if available, fallback to focus+click
    function openDatePicker(input) {
        if (!input) return;
        try {
            if (typeof input.showPicker === 'function') {
                input.showPicker();
                return;
            }
        } catch (e) {
            // ignore and fallback
        }
        try {
            input.focus();
            input.click();
        } catch (e) {
            // ignore
        }
    }

    const dateWrappers = document.querySelectorAll(".date-wrapper");
    dateWrappers.forEach(wrapper => {
        const input = wrapper.querySelector("input[type='date']");
        if (!input) return;

        const update = () => {
            if (input.value) {
                wrapper.classList.add("has-value");
            } else {
                wrapper.classList.remove("has-value");
            }
        };

        input.addEventListener("focus", () => {
            wrapper.classList.add("is-focused");
        });

        input.addEventListener("blur", () => {
            wrapper.classList.remove("is-focused");
            update();
        });

        input.addEventListener("change", update);

        // Inline error element (for submit-time messages)
        let errorEl = wrapper.querySelector('.date-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'date-error';
            errorEl.style.display = 'none';
            wrapper.appendChild(errorEl);
        }

        // run initial update state
        update();

        // react to changes: only update visual state; validation occurs on submit
        input.addEventListener('change', () => {
            update();
            // clear any previous inline date error when user changes value
            if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
        });

        // Make calendar icon clickable to open date picker (use showPicker when available)
        const calendarIcon = wrapper.querySelector(".calendar-icon");
        if (calendarIcon) {
            calendarIcon.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                openDatePicker(input);
            });
        }
    });

    // 3) WEIGHT / NUMBER INPUTS: highlight unit box on focus
    const weightWrappers = document.querySelectorAll(".weight-wrapper");
    weightWrappers.forEach(wrapper => {
        const input = wrapper.querySelector("input[type='number']");
        if (!input) return;

        input.addEventListener("focus", () => {
            wrapper.classList.add("is-focused");
        });

        input.addEventListener("blur", () => {
            wrapper.classList.remove("is-focused");
        });
    });

    // Validation helpers (validate on submit only, show inline span errors)
    function getWrapperForField(fieldEl) {
        if (!fieldEl) return null;
        return fieldEl.closest('.input-wrapper') || fieldEl.parentElement;
    }

    function getOrCreateErrorEl(wrapper) {
        if (!wrapper) return null;
        let el = wrapper.querySelector('.field-error');
        if (!el) {
            el = document.createElement('span');
            el.className = 'field-error';
            el.style.display = 'none';
            wrapper.appendChild(el);
        }
        return el;
    }

    function clearFormErrors(form) {
        if (!form) return;
        form.querySelectorAll('.field-error').forEach(fe => {
            fe.textContent = '';
            fe.style.display = 'none';
        });
        // also hide date-error elements inside wrappers
        form.querySelectorAll('.date-error').forEach(de => { de.textContent = ''; de.style.display = 'none'; });
    }

    function isDateTooOld(value) {
        if (!value) return false;
        const picked = new Date(value + 'T00:00:00');
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        return picked < oneYearAgo;
    }

    // Check if date is older than given months (e.g., 6 months)
    function isDateOlderThanMonths(value, months) {
        if (!value) return false;
        const picked = new Date(value + 'T00:00:00');
        const today = new Date();
        const cutoff = new Date(today);
        cutoff.setMonth(cutoff.getMonth() - months);
        // normalize time
        cutoff.setHours(0,0,0,0);
        return picked < cutoff;
    }

    function isValidWeightValue(val) {
        if (val === null || val === undefined || val === '') return false;
        const n = parseFloat(val);
        if (isNaN(n)) return false;
        if (n < 1) return false; // minimum believable weight is 1 kg
        if (n > 120) return false; // maximum believable weight is 120 kg
        return true;
    }

    // =========================================================================
    // 🔄 STATUS MODAL (CHANGE STATUS FLOW)
    // =========================================================================

    const statusModal        = document.getElementById("statusModal");
    const statusModalContent = document.getElementById("statusModalContent");

    let statusFlow = {
        pigId: null,
        targetStatus: null,
        pricePerKg: null
    };

    function openStatusModal(html) {
        if (!statusModal || !statusModalContent) return;
        statusModalContent.innerHTML = html;
        statusModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeStatusModal() {
        if (!statusModal) return;
        statusModal.style.display = "none";
        document.body.style.overflow = "auto";
        if (statusModalContent) statusModalContent.innerHTML = "";
    }

    function startStatusChangeFlow(pig, targetStatus) {
        statusFlow = {
            pigId: pig.id,
            targetStatus,
            pricePerKg: null
        };

        // --- GROWING ---
        if (targetStatus === "growing") {
            openStatusModal(`
                <h3>Change Status</h3>
                <p>Mark <strong>${pig.name}</strong> as <strong>Growing</strong>?</p>
                <div class="status-modal-actions">
                    <button class="btn-secondary" data-status-action="cancel">No</button>
                    <button class="btn-primary" data-status-action="confirm-growing">Yes</button>
                </div>
            `);
            return;
        }


        // --- TO SALE (simple confirm) ---
        // Make `tosale` a simple confirmation flow (no price entry) per user request
        if (targetStatus === "tosale") {
            openStatusModal(`
                <h3>Change Status</h3>
                <p>Mark <strong>${pig.name}</strong> as <strong>To Sale</strong>?</p>
                <div class="status-modal-actions">
                    <button class="btn-secondary" data-status-action="cancel">No</button>
                    <button class="btn-primary" data-status-action="confirm-tosale">Yes</button>
                </div>
            `);
            return;
        }


        // --- SOLD (price flow) ---
        // When marking a pig as 'Sold' we need a price input and confirmation
        if (targetStatus === "sold") {
            openStatusModal(`
                <h3>Sold Price</h3>
                <p>Enter sale price of your pig (per kilogram):</p>

                <div class="status-input-row">
                    <span class="peso-prefix">₱</span>
                    <input type="number" id="statusPriceInput" min="0" step="0.01" placeholder="0.00">
                    <span class="per-kg">/kg</span>
                </div>
                <small class="status-error" id="statusPriceError"></small>

                <div class="status-modal-actions">
                    <button class="btn-secondary" data-status-action="cancel">No</button>
                    <button class="btn-primary" data-status-action="calc-price">Calculate</button>
                </div>
            `);
            return;
        }

        // --- DECEASED ---
        if (targetStatus === "deceased") {
            openStatusModal(`
                <h3>Change Status</h3>
                <p>Mark <strong>${pig.name}</strong> as <strong>Deceased</strong>?</p>
                <div class="status-modal-actions">
                    <button class="btn-secondary" data-status-action="cancel">No</button>
                    <button class="btn-primary" data-status-action="confirm-deceased">Yes</button>
                </div>
            `);
        }
    }

    if (statusModal) {
        statusModal.addEventListener("click", (e) => {
            // Click outside card closes modal
            if (e.target === statusModal) {
                closeStatusModal();
                return;
            }

            const action = e.target.dataset.statusAction;
            if (!action) return;

            const currentFarm = getCurrentFarm();
            if (!currentFarm) {
                closeStatusModal();
                return;
            }

            // Determine whether this action needs a single pig (statusFlow.pigId)
            const actionsNeedingPig = [
                'confirm-growing','calc-price','back-to-price','show-receipt','confirm-sold','confirm-tosale','confirm-deceased'
            ];

            let pig = null;
            if (actionsNeedingPig.includes(action)) {
                pig = currentFarm.pigs.find(p => p.id === statusFlow.pigId);
                if (!pig) {
                    closeStatusModal();
                    return;
                }
            }

            // Helper to safely get last weight for To Sale receipt (only valid when pig exists)
            const getLastWeight = () => {
                if (!pig || !pig.weightHistory || pig.weightHistory.length === 0) return null;
                return pig.weightHistory[pig.weightHistory.length - 1].weight;
            };

            switch (action) {
                case "cancel":
                    closeStatusModal();
                    break;

                // GROWING confirm
                case "confirm-growing":
                    pig.status = "growing";
                    closeStatusModal();
                    loadFarmData();
                    showAlert("success", `${pig.name} changed into Growing.`);
                    break;

                // Proceed from bulk price entry to receipt (single shared price)
                case "proceed-sold-receipt": {
                    // retrieve stored bulk context
                    const bulkIds = window._bulkSellPigIds || [];
                    const farmId = window._bulkSellFarmId || null;
                    const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
                    if (!farm || bulkIds.length === 0) {
                        closeStatusModal();
                        return;
                    }
                    showSoldReceiptSummary(bulkIds, farm);
                    break;
                }

                // (confirm-sold is handled as the final step of the 'sold' price flow)

                // DECEASED confirm
                case "confirm-deceased":
                    pig.status = "deceased";
                    closeStatusModal();
                    loadFarmData();
                    showAlert("success", `${pig.name} changed into Deceased.`);
                    break;

                // TO SALE: step 1 → validate price, then show confirm price
                case "calc-price": {
                    const priceInput = document.getElementById("statusPriceInput");
                    const errLabel   = document.getElementById("statusPriceError");
                    const value      = priceInput ? parseFloat(priceInput.value) : NaN;

                    if (isNaN(value) || value <= 0) {
                        if (errLabel) errLabel.textContent = "Please enter a valid price per kg.";
                        if (priceInput) priceInput.focus();
                        return;
                    }

                    statusFlow.pricePerKg = value.toFixed(2);

                    openStatusModal(`
                        <h3>Confirm Price</h3>
                        <p>Please confirm: You're setting the price at <strong>₱${statusFlow.pricePerKg}</strong> per kilogram for this pig.</p>
                        <div class="status-modal-actions">
                            <button class="btn-secondary" data-status-action="back-to-price">No</button>
                            <button class="btn-primary" data-status-action="show-receipt">Yes</button>
                        </div>
                    `);
                    break;
                }

                // SOLD price flow: go back to price step
                case "back-to-price":
                    startStatusChangeFlow(pig, "sold");
                    break;

                // TO SALE: show receipt with total
                case "show-receipt": {
                    const lastWeight = getLastWeight();
                    if (lastWeight == null) {
                        closeStatusModal();
                        showAlert("error", "No weight record found to calculate total price.");
                        return;
                    }

                    const price   = parseFloat(statusFlow.pricePerKg || "0");
                    const total   = (lastWeight * price).toFixed(2);

                    openStatusModal(`
                        <h3>Sale Summary</h3>
                        <p>Please review the sale details for <strong>${pig.name}</strong>:</p>

                        <div class="status-receipt">
                            <div class="status-receipt-row">
                                <span>Price per kg</span>
                                <span>₱${price.toFixed(2)}</span>
                            </div>
                            <div class="status-receipt-row">
                                <span>Weight</span>
                                <span>${lastWeight} kg</span>
                            </div>
                            <div class="status-total">
                                Total: ₱${total}
                            </div>
                        </div>

                        <div class="status-modal-actions">
                            <button class="btn-secondary" data-status-action="cancel">Cancel</button>
                            <button class="btn-primary" data-status-action="confirm-sold">Confirm</button>
                        </div>
                    `);
                    break;
                }

                // SOLD: final confirm from price flow (status becomes "sold")
                case "confirm-sold": {
                    // attach price info to statusHistory for traceability
                    const lastWeight = getLastWeight();
                    const pricePerKg = parseFloat(statusFlow.pricePerKg || 0);
                    const total = lastWeight != null ? (lastWeight * pricePerKg).toFixed(2) : null;

                    pig.status = "sold";
                    pig.statusHistory = pig.statusHistory || [];
                    pig.statusHistory.push({
                        date: new Date().toISOString().split('T')[0],
                        status: 'sold',
                        pricePerKg: pricePerKg || null,
                        total: total || null,
                        notes: 'Sold (price set)'
                    });

                    closeStatusModal();
                    loadFarmData();
                    showAlert("success", `${pig.name} changed into Sold.`);
                    break;
                }

                // TO SALE: final confirm (status becomes "tosale")
                case "confirm-tosale":
                    pig.status = "tosale";
                    closeStatusModal();
                    loadFarmData();
                    showAlert("success", `${pig.name} changed into To Sale.`);
                    break;

                // BULK SOLD: final confirm from receipt
                case "confirm-sold-batch": {
                    const pricePerKg = window._soldPricePerKg || 0;
                    const currentFarm = getCurrentFarm();
                    if (!currentFarm) {
                        closeStatusModal();
                        return;
                    }

                    const checkboxes = Array.from(document.querySelectorAll('.pig-checkbox'));
                    const selectedIds = checkboxes
                        .filter(cb => cb.checked && !cb.disabled)
                        .map(cb => Number(cb.dataset.pigId));

                    let changedCount = 0;
                    selectedIds.forEach(id => {
                        const p = currentFarm.pigs.find(pg => pg.id === id);
                        if (!p) return;

                        let currentWeight = 0;
                        if (p.weightHistory && p.weightHistory.length > 0) {
                            currentWeight = p.weightHistory[p.weightHistory.length - 1].weight || 0;
                        }
                        const total = (currentWeight * pricePerKg).toFixed(2);

                        p.status = "sold";
                        p.statusHistory = p.statusHistory || [];
                        p.statusHistory.push({
                            date: new Date().toISOString().split('T')[0],
                            status: 'sold',
                            pricePerKg: pricePerKg || null,
                            total: total || null,
                            notes: 'Bulk sold (shared price)'
                        });
                        changedCount++;
                    });

                    // clear temporary global
                    window._soldPricePerKg = null;

                    closeStatusModal();
                    loadFarmData();
                    showAlert("success", `${changedCount} pig${changedCount > 1 ? 's' : ''} marked as Sold!`);
                    break;
                }

                // BULK DECEASED: final confirm from warning
                case "confirm-deceased-batch": {
                    const currentFarm = getCurrentFarm();
                    if (!currentFarm) {
                        closeStatusModal();
                        return;
                    }

                    const checkboxes = Array.from(document.querySelectorAll('.pig-checkbox'));
                    const selectedIds = checkboxes
                        .filter(cb => cb.checked && !cb.disabled)
                        .map(cb => Number(cb.dataset.pigId));

                    let changedCount = 0;
                    let pigNames = [];
                    selectedIds.forEach(id => {
                        const p = currentFarm.pigs.find(pg => pg.id === id);
                        if (!p) return;

                        p.status = "deceased";
                        p.statusHistory = p.statusHistory || [];
                        p.statusHistory.push({
                            date: new Date().toISOString().split('T')[0],
                            status: 'deceased',
                            notes: 'Marked as deceased'
                        });
                        pigNames.push(p.name);
                        changedCount++;
                    });

                    closeStatusModal();
                    loadFarmData();

                    // Show alert with undo option stored in localStorage
                    const undoData = { pigIds: selectedIds, status: 'growing', timestamp: Date.now() };
                    window._lastDeceasedUndo = undoData;

                    const pigList = pigNames.join(', ');
                    // show success with an undo button and auto-close after 5 seconds
                    showAlert("success", `${pigList} marked as Deceased.`, true, function() {
                        // Undo callback
                        if (window._lastDeceasedUndo) {
                            const farm = getCurrentFarm();
                            if (farm) {
                                window._lastDeceasedUndo.pigIds.forEach(id => {
                                    const p = farm.pigs.find(pg => pg.id === id);
                                    if (p) {
                                        p.status = 'growing';
                                        p.statusHistory = p.statusHistory || [];
                                        p.statusHistory.push({
                                            date: new Date().toISOString().split('T')[0],
                                            status: 'growing',
                                            notes: 'Undid deceased status'
                                        });
                                    }
                                });
                                loadFarmData();
                                showAlert("success", "Undo successful! Pigs restored to Growing status.");
                            }
                        }
                    }, 5000);
                    break;
                }
            }
        });
    }

    // =========================================================================
    // 📋 SOLD RECEIPT MODAL (Multiple pigs)
    // =========================================================================
    
    // Modified: Use a single price per kg for all selected pigs, then show totals
    function showSoldReceiptModal(pigIds, farm) {
        if (!statusModal || !statusModalContent) return;

        // Build simple list with pig names and weights for review
        let pigsListHtml = '';
        pigIds.forEach(pigId => {
            const pig = farm.pigs.find(p => p.id === pigId);
            if (!pig) return;
            let currentWeight = 0;
            if (pig.weightHistory && pig.weightHistory.length > 0) {
                currentWeight = pig.weightHistory[pig.weightHistory.length - 1].weight || 0;
            }
            pigsListHtml += `<li data-pig-id="${pig.id}"><strong>${pig.name}</strong> - ${currentWeight} kg</li>`;
        });

        openStatusModal(`
            <h3>Sell Multiple Pigs</h3>
            <p>Enter a single <strong>price per kg</strong> to apply to all selected pigs:</p>

            <div class="status-input-row">
                <span class="peso-prefix">₱</span>
                <input type="number" id="soldPricePerKg" min="0" step="0.01" placeholder="0.00">
                <span class="per-kg">/kg</span>
            </div>
            <small class="status-error" id="soldPriceError" style="display:block; margin-top:6px;"></small>

            <ul class="sold-pigs-list" style="list-style:none; padding:0; margin:15px 0;">
                ${pigsListHtml}
            </ul>

            <div class="status-modal-actions">
                <button class="btn-secondary" data-status-action="cancel">Cancel</button>
                <button class="btn-primary" data-status-action="proceed-sold-receipt">Proceed</button>
            </div>
        `);

        // store bulk context so the central statusModal click handler can access it
        window._bulkSellPigIds = pigIds.slice();
        window._bulkSellFarmId = farm && farm.id ? farm.id : null;

        const proceedBtn = statusModalContent.querySelector('[data-status-action="proceed-sold-receipt"]');
        if (proceedBtn) {
            // keep the local onclick as a fallback
            proceedBtn.onclick = function () {
                showSoldReceiptSummary(pigIds, farm);
            };
        }
    }

    function showSoldReceiptSummary(pigIds, farm) {
        if (!statusModal || !statusModalContent) return;

        const priceInput = statusModalContent.querySelector('#soldPricePerKg');
        const errLabel = statusModalContent.querySelector('#soldPriceError');
        const pricePerKg = priceInput ? parseFloat(priceInput.value) : NaN;

        if (isNaN(pricePerKg) || pricePerKg <= 0) {
            if (errLabel) errLabel.textContent = 'Please enter a valid price per kg.';
            if (priceInput) priceInput.focus();
            return;
        }

        // Calculate per-pig totals and grand totals, and render a clearer receipt UI
        let totalRevenue = 0;
        let totalExpenses = 0;
        let receiptRows = '';

        pigIds.forEach(pigId => {
            const pig = farm.pigs.find(p => p.id === pigId);
            if (!pig) return;

            let currentWeight = 0;
            if (pig.weightHistory && pig.weightHistory.length > 0) {
                currentWeight = pig.weightHistory[pig.weightHistory.length - 1].weight || 0;
            }

            const pigRevenue = (currentWeight * pricePerKg);
            totalRevenue += pigRevenue;

            let pigExpenses = 0;
            if (Array.isArray(pig.expenses)) {
                pigExpenses = pig.expenses.reduce((sum, exp) => sum + (parseFloat(exp.price) || 0), 0);
            }
            totalExpenses += pigExpenses;

            const pigProfit = pigRevenue - pigExpenses;

            receiptRows += `<tr>
                <td style="text-align:left; padding-left:10px;">${pig.name}</td>
                <td>${currentWeight} kg</td>
                <td>₱${pricePerKg.toFixed(2)}</td>
                <td>₱${pigRevenue.toFixed(2)}</td>
                <td>₱${pigExpenses.toFixed(2)}</td>
                <td style="font-weight:700;">₱${pigProfit.toFixed(2)}</td>
            </tr>`;
        });

        const totalProfit = (totalRevenue - totalExpenses);

        openStatusModal(`
            <div class="receipt-vertical">
                <div class="receipt-header">
                    <div class="receipt-title">Sale Receipt</div>
                    <div class="receipt-date">${new Date().toLocaleDateString()}</div>
                </div>

                <div class="receipt-intro">Review the breakdown below. Each pig is shown with weight, revenue, expenses and profit.</div>

                <div class="receipt-list">
                    ${pigIds.map(pigId => {
                        const pig = farm.pigs.find(p => p.id === pigId);
                        if (!pig) return '';
                        let currentWeight = 0;
                        if (pig.weightHistory && pig.weightHistory.length > 0) {
                            currentWeight = pig.weightHistory[pig.weightHistory.length - 1].weight || 0;
                        }
                        const pigRevenue = (currentWeight * pricePerKg);
                        let pigExpenses = 0;
                        if (Array.isArray(pig.expenses)) {
                            pigExpenses = pig.expenses.reduce((sum, exp) => sum + (parseFloat(exp.price) || 0), 0);
                        }
                        const pigProfit = pigRevenue - pigExpenses;

                        return (`\n                        <div class="pig-card">\n                            <div class="pig-card-left">\n                                <div class="pig-name">${pig.name}</div>\n                                <div class="pig-meta">ID: ${pig.id} • ${currentWeight} kg</div>\n                            </div>\n                            <div class="pig-card-right">\n                                <div class="pig-row"><span>Price/kg</span><strong>₱${pricePerKg.toFixed(2)}</strong></div>\n                                <div class="pig-row"><span>Revenue</span><strong>₱${pigRevenue.toFixed(2)}</strong></div>\n                                <div class="pig-row"><span>Expenses</span><strong>₱${pigExpenses.toFixed(2)}</strong></div>\n                                <div class="pig-row profit"><span>Profit</span><strong>₱${pigProfit.toFixed(2)}</strong></div>\n                            </div>\n                        </div>`);
                    }).join('')}
                </div>

                <div class="receipt-totals">
                    <div class="totals-left">Items: ${pigIds.length}</div>
                    <div class="totals-right">
                        <div class="tot-line"><span>Total Revenue</span><strong>₱${totalRevenue.toFixed(2)}</strong></div>
                        <div class="tot-line"><span>Total Expenses</span><strong>₱${totalExpenses.toFixed(2)}</strong></div>
                        <div class="tot-line net"><span>Net Profit</span><strong>₱${totalProfit.toFixed(2)}</strong></div>
                    </div>
                </div>

                <div class="receipt-actions">
                    <button class="btn-secondary" data-status-action="cancel">Cancel</button>
                    <button class="btn-primary" data-status-action="confirm-sold-batch">Confirm Sale</button>
                </div>
            </div>
        `);
        // Store shared price for confirm handler
        window._soldPricePerKg = pricePerKg;

        // Attach drag-to-scroll behavior for the receipt list (horizontal drag)
        // This makes the receipt easier to navigate with mouse/touch when wide.
        try {
            const receiptList = statusModalContent.querySelector('.receipt-list');
            if (receiptList) {
                let isDown = false;
                let startX;
                let scrollLeft;

                receiptList.addEventListener('pointerdown', (e) => {
                    isDown = true;
                    receiptList.setPointerCapture(e.pointerId);
                    startX = e.clientX;
                    scrollLeft = receiptList.scrollLeft;
                    receiptList.style.cursor = 'grabbing';
                });

                receiptList.addEventListener('pointerup', (e) => {
                    isDown = false;
                    try { receiptList.releasePointerCapture(e.pointerId); } catch (err) {}
                    receiptList.style.cursor = 'grab';
                });

                receiptList.addEventListener('pointercancel', () => {
                    isDown = false;
                    receiptList.style.cursor = 'grab';
                });

                receiptList.addEventListener('pointermove', (e) => {
                    if (!isDown) return;
                    const x = e.clientX;
                    const walk = (startX - x); // scroll-fast
                    receiptList.scrollLeft = scrollLeft + walk;
                });
            }
        } catch (err) {
            // non-fatal if pointer events aren't supported
            console.warn('Receipt drag attach failed', err);
        }
    }

    // =========================================================================
    // ☠️ DECEASED WARNING MODAL
    // =========================================================================

    function showDeceasedWarningModal(pigIds, farm) {
        if (!statusModal || !statusModalContent) return;

        const pigNames = pigIds
            .map(id => {
                const pig = farm.pigs.find(p => p.id === id);
                return pig ? pig.name : 'Unknown';
            })
            .join(', ');

        openStatusModal(`
            <h3>⚠️ Permanent Action</h3>
            
            <div class="warning-box">
                <p><strong>WARNING:</strong> Marking ${pigIds.length === 1 ? 'this pig' : 'these pigs'} as <strong>Deceased</strong> is a permanent action that <strong>CANNOT be undone</strong>.</p>
                <p style="margin-top: 10px; font-weight: 600;">Pig${pigIds.length > 1 ? 's' : ''}: <em>${pigNames}</em></p>
            </div>

            <div class="status-modal-actions">
                <button class="btn-secondary" data-status-action="cancel">Cancel</button>
                <button class="btn-danger" data-status-action="confirm-deceased-batch">Yes, Mark as Deceased</button>
            </div>
        `);
    }

    // =========================================================================
    function changeSelectedPigsStatus(newStatus) {
        // Use up-to-date checkbox list (DOM may have changed)
        const checkboxes = Array.from(document.querySelectorAll('.pig-checkbox'));
        const selectedIds = checkboxes
            .filter(cb => cb.checked && !cb.disabled)
            .map(cb => Number(cb.dataset.pigId));

        if (selectedIds.length === 0) {
            showAlert("warning", "Please select at least one pig to change status.");
            return;
        }

        const currentFarm = getCurrentFarm();
        if (!currentFarm) return;

        // Single pig => use existing canned status flow (gives confirmation prompts / price flow)
        if (selectedIds.length === 1) {
            const pig = currentFarm.pigs.find(p => p.id === selectedIds[0]);
            if (!pig) {
                showAlert("error", "Pig not found.");
                return;
            }
            startStatusChangeFlow(pig, newStatus);
            return;
        }

        // Multiple pigs: special handling for 'sold' — show receipt modal
        if (newStatus === 'sold') {
            showSoldReceiptModal(selectedIds, currentFarm);
            return;
        }

        // Deceased: show warning that it's permanent
        if (newStatus === 'deceased') {
            showDeceasedWarningModal(selectedIds, currentFarm);
            return;
        }

        // Multiple pigs: allow bulk updates for other statuses
        const allowedBulk = ['growing', 'tosale'];
        if (!allowedBulk.includes(newStatus)) {
            showAlert("warning", "Cannot bulk-change to the selected status.");
            return;
        }

        let changedCount = 0;
        selectedIds.forEach(id => {
            const pig = currentFarm.pigs.find(p => p.id === id);
            if (pig) {
                pig.status = newStatus;
                pig.statusHistory = pig.statusHistory || [];
                pig.statusHistory.push({ date: new Date().toISOString().split('T')[0], status: newStatus, notes: 'Bulk change' });
                changedCount++;
            }
        });

        if (changedCount > 0) {
            loadFarmData();
            showAlert("success", `${changedCount} pig${changedCount > 1 ? 's' : ''} changed into ${formatStatusText(newStatus)}.`);
        } else {
            showAlert("warning", "No pigs were updated.");
        }
    }

    // =========================================================================
    // 🧷 EVENT LISTENERS (TOP-LEVEL UI)
    // =========================================================================

    // Farm tabs
    let lastTabTouch = 0;
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            const farmId = parseInt(this.dataset.farm, 10);
            switchToFarm(farmId);
        });

        // Double-click shows a small actions dropdown for the tab (Rename / Delete)
        tab.addEventListener('dblclick', function (e) {
            const farmId = Number(this.dataset.farm);
            showTabActionsDropdown(this, farmId);
            e.stopPropagation();
        });

        // Touch devices: emulate double-tap to open the dropdown
        tab.addEventListener('touchend', function (e) {
            const now = Date.now();
            // if second tap within 350ms -> treat as double-tap
            if (now - lastTabTouch <= 350) {
                const farmId = Number(this.dataset.farm);
                showTabActionsDropdown(this, farmId);
                e.stopPropagation();
                // reset
                lastTabTouch = 0;
            } else {
                lastTabTouch = now;
            }
        });
    });

    // Add farm tab (+)
    if (tabAdd) {
        tabAdd.addEventListener("click", addNewFarm);
    }

    // ---------------------------
    // Rename / Delete Farm UI
    // ---------------------------
    function openRenameFarmModalFor(farmId) {
        if (!renameFarmModal || !renameFarmForm || !newFarmNameInput) return;
        const farm = getFarmById(farmId);
        if (!farm) return;

        currentEditFarmId = Number(farmId);
        newFarmNameInput.value = farm.name || '';
        renameFarmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function openDeleteFarmConfirmFor(farmId) {
        if (!deleteFarmConfirmModal || !deleteFarmConfirmText || !confirmDeleteFarmBtn) return;
        const farm = getFarmById(farmId);
        if (!farm) return;

        currentEditFarmId = Number(farmId);
        deleteFarmConfirmText.textContent = `Are you sure you want to delete ${farm.name}?\nThis action cannot be undone.`;
        const input = document.getElementById('confirmDeleteFarmInput');
        if (input) input.value = '';
        if (confirmDeleteFarmBtn) confirmDeleteFarmBtn.disabled = true;

        deleteFarmConfirmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function showTabActionsDropdown(tabEl, farmId) {
        // Show a small inline dropdown anchored to the tab element (not a modal)
        // Behaviour mirrors the pig-details actions dropdown (Edit / Delete), and
        // will call the existing rename/delete modal flows when the buttons are clicked.

        currentEditFarmId = Number(farmId);
        const farm = getFarmById(farmId);
        if (!farm) return;

        // Remove any existing dropdown first
        const existing = document.querySelector('.tab-actions-dropdown');
        if (existing) existing.remove();

        // Create dropdown element
        const dd = document.createElement('div');
        dd.className = 'tab-actions-dropdown';
        dd.style.position = 'absolute';
        dd.style.zIndex = 9999;
        dd.style.background = '#fff';
        dd.style.border = '1px solid rgba(0,0,0,0.08)';
        dd.style.borderRadius = '8px';
        dd.style.padding = '6px 0';

        // Rename button
        const renameBtn = document.createElement('button');
        renameBtn.innerHTML = '<i class="fa-solid fa-pen" style="margin-right:8px"></i> Rename Farm';
        renameBtn.style.background = 'transparent';
        renameBtn.style.border = 'none';
        renameBtn.style.width = '100%';
        renameBtn.style.padding = '8px 12px';
        renameBtn.style.textAlign = 'left';
        renameBtn.style.cursor = 'pointer';

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash" style="margin-right:8px"></i> Delete Farm';
        deleteBtn.className = 'delete';
        deleteBtn.style.background = 'transparent';
        deleteBtn.style.border = 'none';
        deleteBtn.style.width = '100%';
        deleteBtn.style.padding = '8px 12px';
        deleteBtn.style.textAlign = 'left';
        deleteBtn.style.cursor = 'pointer';

        dd.appendChild(renameBtn);
        dd.appendChild(deleteBtn);

        document.body.appendChild(dd);

        // Position dropdown beneath the tab element (centered)
        const rect = tabEl.getBoundingClientRect();
        const left = Math.max(8, rect.left + window.scrollX + rect.width / 2 - dd.offsetWidth / 2);
        const top  = rect.bottom + window.scrollY + 8;
        dd.style.left = left + 'px';
        dd.style.top  = top + 'px';

        // Hook up actions
        renameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Launch rename flow (modal remains as the actual editing UI)
            openRenameFarmModalFor(farmId);
            dd.remove();
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Launch delete confirmation flow
            openDeleteFarmConfirmFor(farmId);
            dd.remove();
        });

        // Clicking anywhere else closes the dropdown
        const onDocClick = (ev) => {
            if (!ev.target.closest || !ev.target.closest('.tab-actions-dropdown')) {
                dd.remove();
                document.removeEventListener('click', onDocClick);
                document.removeEventListener('keydown', onEsc);
            }
        };

        const onEsc = (ev) => {
            if (ev.key === 'Escape') {
                dd.remove();
                document.removeEventListener('click', onDocClick);
                document.removeEventListener('keydown', onEsc);
            }
        };

        // Use a short timeout so the click that created the dropdown isn't immediately swallowed
        setTimeout(() => {
            document.addEventListener('click', onDocClick);
            document.addEventListener('keydown', onEsc);
        }, 0);
    }

    // ---------------------------
    // Delete Farm confirm handlers
    if (closeDeleteFarmConfirmModalBtn) {
        closeDeleteFarmConfirmModalBtn.addEventListener('click', () => {
            if (deleteFarmConfirmModal) deleteFarmConfirmModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (cancelDeleteFarmBtn) {
        cancelDeleteFarmBtn.addEventListener('click', () => {
            if (deleteFarmConfirmModal) deleteFarmConfirmModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    const confirmDeleteFarmInput = document.getElementById('confirmDeleteFarmInput');
    if (confirmDeleteFarmInput) {
        confirmDeleteFarmInput.addEventListener('input', function () {
            const ok = this.value && this.value.trim().toLowerCase() === 'delete';
            if (confirmDeleteFarmBtn) confirmDeleteFarmBtn.disabled = !ok;
        });
    }

    if (confirmDeleteFarmBtn) {
        confirmDeleteFarmBtn.addEventListener('click', () => {
            // proceed to delete currentEditFarmId
            const id = currentEditFarmId;
            if (!id) return;

            const idx = farms.findIndex(f => f.id === id);
            if (idx === -1) {
                showAlert('error', 'Farm not found.');
                return;
            }

            // remove tab element
            const tabEl = document.querySelector(`.tab[data-farm="${id}"]`);
            if (tabEl) tabEl.remove();

            farms.splice(idx, 1);

            // if removed current farm, pick first available
            if (currentFarmId === id) {
                currentFarmId = farms.length > 0 ? farms[0].id : null;
            }

            if (deleteFarmConfirmModal) deleteFarmConfirmModal.style.display = 'none';
            document.body.style.overflow = 'auto';

            loadFarmData();
            showAlert('success', 'Successfully Deleted Farm');
        });
    }

    // ---------------------------
    // Delete Pig confirm handlers
    // ---------------------------
    if (closeDeletePigConfirmModalBtn) {
        closeDeletePigConfirmModalBtn.addEventListener('click', () => {
            if (deletePigConfirmModal) deletePigConfirmModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            // re-open pig details if we still have a pig selected
            if (pigDetailsModal && pigDetailsFrame && pigDetailsFrame.src) pigDetailsModal.style.display = 'flex';
        });
    }

    if (cancelDeletePigBtn) {
        cancelDeletePigBtn.addEventListener('click', () => {
            if (deletePigConfirmModal) deletePigConfirmModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (pigDetailsModal && pigDetailsFrame && pigDetailsFrame.src) pigDetailsModal.style.display = 'flex';
        });
    }

    if (confirmDeletePigInput) {
        confirmDeletePigInput.addEventListener('input', function () {
            const ok = this.value && this.value.trim().toLowerCase() === 'delete';
            if (confirmDeletePigBtn) confirmDeletePigBtn.disabled = !ok;
        });
    }

    if (confirmDeletePigBtn) {
        confirmDeletePigBtn.addEventListener('click', () => {
            // delete pig by currentDetailPigId / currentDetailFarmId
            const pid = currentDetailPigId;
            const fid = currentDetailFarmId || currentFarmId;
            const farm = fid ? getFarmById(fid) : getCurrentFarm();
            if (!farm) {
                showAlert('error', 'Farm not found.');
                return;
            }

            const idx = farm.pigs.findIndex(p => p.id === pid);
            if (idx === -1) {
                showAlert('error', 'Pig not found.');
                return;
            }

            const pigName = farm.pigs[idx].name;
            farm.pigs.splice(idx, 1);

            if (deletePigConfirmModal) deletePigConfirmModal.style.display = 'none';
            // close pig details
            if (pigDetailsModal) pigDetailsModal.style.display = 'none';
            if (pigDetailsFrame) pigDetailsFrame.src = '';

            loadFarmData();
            showAlert('success', 'Successfully Deleted Pig');
        });
    }

    // Close rename handlers
    if (cancelRenameFarmBtn) cancelRenameFarmBtn.addEventListener('click', () => {
        if (renameFarmModal) renameFarmModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // ---------------------------
    // Delete Record confirm handlers (Weight, Expense, Vaccination)
    // ---------------------------
    const closeDeleteRecordConfirmModal = document.getElementById("closeDeleteRecordConfirmModal");
    const cancelDeleteRecordBtn = document.getElementById("cancelDeleteRecord");
    const confirmDeleteRecordBtn = document.getElementById("confirmDeleteRecord");
    const deleteRecordConfirmModal = document.getElementById("deleteRecordConfirmModal");

    if (closeDeleteRecordConfirmModal) {
        closeDeleteRecordConfirmModal.addEventListener("click", () => {
            if (deleteRecordConfirmModal) deleteRecordConfirmModal.style.display = "none";
            document.body.style.overflow = "auto";
            pendingDeleteData = null;
        });
    }

    if (cancelDeleteRecordBtn) {
        cancelDeleteRecordBtn.addEventListener("click", () => {
            if (deleteRecordConfirmModal) deleteRecordConfirmModal.style.display = "none";
            document.body.style.overflow = "auto";
            pendingDeleteData = null;
        });
    }

    if (confirmDeleteRecordBtn) {
        confirmDeleteRecordBtn.addEventListener("click", () => {
            if (!pendingDeleteData) return;

            const { type, pigId, farmId, index } = pendingDeleteData;
            const farm = farmId ? getFarmById(farmId) : getCurrentFarm();
            
            if (!farm) {
                showAlert("error", "Farm not found.");
                return;
            }

            const pig = farm.pigs.find(p => p.id === pigId);
            if (!pig) {
                showAlert("error", "Pig not found.");
                return;
            }

            let deleted = false;
            let typeName = "";

            // Execute the appropriate delete
            switch (type) {
                case "weight":
                    if (pig.weightHistory && pig.weightHistory[index]) {
                        pig.weightHistory.splice(index, 1);
                        deleted = true;
                        typeName = "Weight record";
                    }
                    break;
                case "expense":
                    if (pig.expenses && pig.expenses[index]) {
                        pig.expenses.splice(index, 1);
                        deleted = true;
                        typeName = "Expense record";
                    }
                    break;
                case "vaccination":
                    if (pig.vaccinations && pig.vaccinations[index]) {
                        pig.vaccinations.splice(index, 1);
                        deleted = true;
                        typeName = "Vaccination record";
                    }
                    break;
            }

            if (deleted) {
                // Refresh pig details iframe
                const pigDetailsFrame = document.getElementById("pigDetailsFrame");
                if (pigDetailsFrame && pigDetailsFrame.contentWindow) {
                    const updatedPig = getPigDataById(pigId, farmId);
                    pigDetailsFrame.contentWindow.postMessage({ type: "pigData", pig: updatedPig }, "*");
                }
            }

            if (deleteRecordConfirmModal) deleteRecordConfirmModal.style.display = "none";
            document.body.style.overflow = "auto";
            pendingDeleteData = null;
        });
    }

    // Close rename handlers
    if (cancelRenameFarmBtn) cancelRenameFarmBtn.addEventListener('click', () => {
        if (renameFarmModal) renameFarmModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    if (closeRenameFarmModalBtn) closeRenameFarmModalBtn.addEventListener('click', () => {
        if (renameFarmModal) renameFarmModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    if (renameFarmForm) {
        renameFarmForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = (newFarmNameInput?.value || '').trim();
            if (!name) {
                showAlert('warning', 'Please enter a farm name.');
                return;
            }
            const farm = getFarmById(currentEditFarmId);
            if (!farm) {
                showAlert('error', 'Farm not found.');
                return;
            }
            farm.name = name;

            // update tab label if it exists
            const tabEl = document.querySelector(`.tab[data-farm="${currentEditFarmId}"]`);
            if (tabEl) tabEl.textContent = name;

            if (renameFarmModal) renameFarmModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            showAlert('success', 'Farm renamed successfully.');
        });
    }

    // Farm tab actions modal button listeners
    if (closeFarmTabActionsModalBtn) {
        closeFarmTabActionsModalBtn.addEventListener('click', () => {
            if (farmTabActionsModal) farmTabActionsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (farmTabRenameBtn) {
        farmTabRenameBtn.addEventListener('click', () => {
            if (farmTabActionsModal) farmTabActionsModal.style.display = 'none';
            openRenameFarmModalFor(currentEditFarmId);
        });
    }

    if (farmTabDeleteBtn) {
        farmTabDeleteBtn.addEventListener('click', () => {
            if (farmTabActionsModal) farmTabActionsModal.style.display = 'none';
            openDeleteFarmConfirmFor(currentEditFarmId);
        });
    }

    // Close farm tab actions modal when clicking outside
    if (farmTabActionsModal) {
        farmTabActionsModal.addEventListener('click', (e) => {
            if (e.target === farmTabActionsModal) {
                farmTabActionsModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Open delete farm confirm from rename modal
    if (btnRenameModalDeleteFarm) {
        btnRenameModalDeleteFarm.addEventListener('click', () => {
            if (!currentEditFarmId) return;
            const farm = getFarmById(currentEditFarmId);
            if (!farm) return;

            if (renameFarmModal) renameFarmModal.style.display = 'none';

            if (deleteFarmConfirmModal) {
                deleteFarmConfirmText.textContent = `Are you sure you want to delete ${farm.name}?\nThis action cannot be undone.`;
                const input = document.getElementById('confirmDeleteFarmInput');
                if (input) input.value = '';
                if (confirmDeleteFarmBtn) confirmDeleteFarmBtn.disabled = true;
                deleteFarmConfirmModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Filter pills
    filterItems.forEach(item => {
        item.addEventListener("click", function () {
            filterItems.forEach(i => i.classList.remove("active"));
            this.classList.add("active");

            const filterType = this.dataset.filter;
            filterPigs(filterType);
        });
    });

    // Dropdown (status change)
    if (dropdownToggle && dropdown) {
        dropdownToggle.addEventListener("click", function (e) {
            e.stopPropagation();
            dropdown.classList.toggle("active");
        });

        document.addEventListener("click", function () {
            dropdown.classList.remove("active");
        });

        dropdownItems?.forEach(item => {
            item.addEventListener("click", function () {
                const status = this.dataset.status;
                changeSelectedPigsStatus(status);
                dropdown.classList.remove("active");
            });
        });
    }

    // Search
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener("input", function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = this.value.toLowerCase().trim();
                searchPigs(searchTerm);
            }, 300);
        });

        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                this.value = "";
                searchPigs("");
            }
        });
    }

    // Main buttons
    if (addPigBtn)       addPigBtn.addEventListener("click", openAddPigModal);
    if (notificationBtn) notificationBtn.addEventListener("click", openNotificationModal);

    // =========================================================================
    // 🚀 INIT
    // =========================================================================

    function init() {
        loadFarmData();
    }

    init();
});  // end DOMContentLoaded

// Profile Modal Setup
document.addEventListener("DOMContentLoaded", () => {
    const profileBtn = document.getElementById("profileBtn");
    const profileModal = document.getElementById("profileModal");

    if (!profileBtn || !profileModal) return;

    profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        profileModal.classList.toggle("open");
    });

    profileModal.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", () => {
        profileModal.classList.remove("open");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") profileModal.classList.remove("open");
    });

    // Logout modal handling
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const logoutConfirmBtn = document.getElementById('logoutConfirmBtn');
    const logoutCancelBtn = document.getElementById('logoutCancelBtn');

    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileModal.classList.remove('open');
            logoutModal.classList.add('open');
            logoutModal.setAttribute('aria-hidden', 'false');
        });

        if (logoutConfirmBtn) {
            logoutConfirmBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        if (logoutCancelBtn) {
            logoutCancelBtn.addEventListener('click', () => {
                logoutModal.classList.remove('open');
                logoutModal.setAttribute('aria-hidden', 'true');
            });
        }

        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) {
                logoutModal.classList.remove('open');
                logoutModal.setAttribute('aria-hidden', 'true');
            }
        });
    }
});
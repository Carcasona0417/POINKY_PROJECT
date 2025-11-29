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
    { id: 1, name: "Farm 1", pigs: [] },
    { id: 2, name: "Farm 2", pigs: [] },
    { id: 3, name: "Farm 3", pigs: [] }
];

let currentFarmId                = 1;
let nextFarmId                   = 4;
let nextPigId                    = 1;
let currentDetailPigId           = null;  // pig whose details we’re viewing
let currentDetailFarmId          = null;  // farm of that pig
let currentEditWeightRecordIndex = null;
let currentEditFarmId            = null;  // used for rename/delete farm UI

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

    const today = new Date().toISOString().split("T")[0];
    if (dateInput)   dateInput.value   = today;
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

    const today = new Date().toISOString().split("T")[0];
    if (dateInput)      dateInput.value   = today;
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

    const today = new Date().toISOString().split("T")[0];
    if (dateInput)    dateInput.value    = today;
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
    const tabActionsDropdown = document.getElementById('tabActionsDropdown');
    const tabRenameBtn = document.getElementById('tabRenameBtn');
    const tabDeleteBtn = document.getElementById('tabDeleteBtn');

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

    // =========================================================================
    // 🔔 ALERT MODAL ELEMENTS + HELPER
    // =========================================================================
    const alertModal   = document.getElementById("alertModal");
    const alertMessage = document.getElementById("alertMessage");
    const alertIcon    = document.getElementById("alertIcon");
    const alertOkBtn   = document.getElementById("alertOkBtn");

    function showAlert(type, message) {
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

        alertModal.style.display = "flex";
        document.body.style.overflow = "hidden";
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

        const today        = new Date().toISOString().split("T")[0];
        const pigDateInput = document.getElementById("pigDate");
        const pigNameInput = document.getElementById("pigName");

        if (pigDateInput) pigDateInput.value = today;
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

            const dateVal   = document.getElementById("newWeightDate")?.value;
            const weightVal = document.getElementById("newWeightValue")?.value;

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

            pig.weightHistory.push(newRecord);
            pig.weight = `${weightVal}kg`;

            if (addWeightModal) addWeightModal.style.display = "none";

            // Re-open details modal & refresh iframe
            if (pigDetailsModal) pigDetailsModal.style.display = "flex";
            if (pigDetailsFrame && pigDetailsFrame.src) {
                pigDetailsFrame.src = pigDetailsFrame.src; // reload
            }

            loadFarmData();
            this.reset();

            const today = new Date().toISOString().split("T")[0];
            const dateInput = document.getElementById("newWeightDate");
            if (dateInput) dateInput.value = today;

            if (fileNameDisplay) {
                fileNameDisplay.textContent      = "Upload Image";
                fileNameDisplay.style.color      = "var(--text-light)";
                fileNameDisplay.style.fontStyle  = "italic";
            }

            showAlert("success", "Weight record added successfully!");
        });
    }

    if (clearWeightFormBtn && addWeightForm) {
        clearWeightFormBtn.addEventListener("click", function () {
            addWeightForm.reset();
            const today = new Date().toISOString().split("T")[0];
            const dateInput = document.getElementById("newWeightDate");
            if (dateInput) dateInput.value = today;

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
            if (pigDetailsModal && pigDetailsFrame && pigDetailsFrame.src) {
                pigDetailsModal.style.display = "flex";
                pigDetailsFrame.src = pigDetailsFrame.src;
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

            const pigData = {
                name:          document.getElementById("pigName")?.value.trim(),
                breed:         document.getElementById("pigBreed")?.value,
                gender:        document.getElementById("pigGender")?.value,
                age:           document.getElementById("pigAge")?.value,
                date:          document.getElementById("pigDate")?.value,
                initialWeight: document.getElementById("pigWeight")?.value
            };

            if (Object.values(pigData).some(val => !val && val !== 0)) {
                showAlert("warning", "Please fill out all pig fields.");
                return;
            }

            addNewPig(pigData);
            addPigForm.reset();
            closeAllModals();

            showAlert("success", "Pig added successfully!");
        });
    }

    if (clearAddPigFormBtn && addPigForm) {
        clearAddPigFormBtn.addEventListener("click", function () {
            addPigForm.reset();
            const today = new Date().toISOString().split("T")[0];
            const pigDateInput = document.getElementById("pigDate");
            if (pigDateInput) pigDateInput.value = today;
        });
    }

    // =========================================================================
    // ✏️ EDIT PIG DETAILS FORM HANDLER (NEW)
    // =========================================================================

    if (editPigDetailsForm) {
        editPigDetailsForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const nameVal   = document.getElementById("editPigName")?.value.trim();
            const breedVal  = document.getElementById("editPigBreed")?.value;
            const genderVal = document.getElementById("editPigGender")?.value;
            const ageVal    = document.getElementById("editPigAge")?.value;
            const dateVal   = document.getElementById("editPigDate")?.value;

            if (!nameVal || !breedVal || !genderVal || !ageVal || !dateVal) {
                showAlert("warning", "Please fill out all pig fields.");
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

            if (pigDetailsModal && pigDetailsFrame && pigDetailsFrame.src) {
                pigDetailsModal.style.display = "flex";
                pigDetailsFrame.src = pigDetailsFrame.src;
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

            const dateVal     = document.getElementById("expenseDate")?.value;
            const priceVal    = document.getElementById("expensePrice")?.value;
            const categoryVal = document.getElementById("expenseCategory")?.value;

            if (!dateVal || !priceVal || !categoryVal) {
                showAlert("warning", "Please fill out all expense fields.");
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
                if (addExpenseModal) addExpenseModal.style.display = "none";
                document.body.style.overflow = "auto";
                return;
            }

            if (!Array.isArray(pig.expenses)) pig.expenses = [];

            pig.expenses.push({
                date:     dateVal,
                price:    parseFloat(priceVal),
                category: categoryVal
            });

            if (addExpenseModal) addExpenseModal.style.display = "none";

            if (pigDetailsModal) pigDetailsModal.style.display = "flex";
            if (pigDetailsFrame && pigDetailsFrame.src) {
                pigDetailsFrame.src = pigDetailsFrame.src;
            }

            loadFarmData();
            this.reset();

            const today     = new Date().toISOString().split("T")[0];
            const dateInput = document.getElementById("expenseDate");
            if (dateInput) dateInput.value = today;

            showAlert("success", "Expense record added successfully!");
        });
    }

    if (clearExpenseFormBtn && addExpenseForm) {
        clearExpenseFormBtn.addEventListener("click", function () {
            addExpenseForm.reset();
            const today     = new Date().toISOString().split("T")[0];
            const dateInput = document.getElementById("expenseDate");
            if (dateInput) dateInput.value = today;
        });
    }

    // =========================================================================
    // ➕ ADD VACCINATION MODAL
    // =========================================================================

    if (addVaccinationForm) {
        addVaccinationForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const dateVal    = document.getElementById("vaccDate")?.value;
            const dueDateVal = document.getElementById("vaccDueDate")?.value;
            const typeVal    = document.getElementById("vaccType")?.value;

            if (!dateVal || !dueDateVal || !typeVal) {
                showAlert("warning", "Please fill out all vaccination fields.");
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
                if (addVaccinationModal) addVaccinationModal.style.display = "none";
                document.body.style.overflow = "auto";
                return;
            }

            if (!Array.isArray(pig.vaccinations)) pig.vaccinations = [];

            pig.vaccinations.push({
                date:    dateVal,
                dueDate: dueDateVal,
                type:    typeVal,
                status:  "scheduled"
            });

            if (addVaccinationModal) addVaccinationModal.style.display = "none";

            if (pigDetailsModal) pigDetailsModal.style.display = "flex";
            if (pigDetailsFrame && pigDetailsFrame.src) {
                pigDetailsFrame.src = pigDetailsFrame.src;
            }

            loadFarmData();
            this.reset();

            const today    = new Date().toISOString().split("T")[0];
            const vaccDate = document.getElementById("vaccDate");
            if (vaccDate) vaccDate.value = today;

            showAlert("success", "Vaccination record added successfully!");
        });
    }

    if (clearVaccinationFormBtn && addVaccinationForm) {
        clearVaccinationFormBtn.addEventListener("click", function () {
            addVaccinationForm.reset();
            const today       = new Date().toISOString().split("T")[0];
            const vaccDate    = document.getElementById("vaccDate");
            const vaccDueDate = document.getElementById("vaccDueDate");
            if (vaccDate)    vaccDate.value    = today;
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
        update();
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

            const pig = currentFarm.pigs.find(p => p.id === statusFlow.pigId);
            if (!pig) {
                closeStatusModal();
                return;
            }

            // Helper to safely get last weight for To Sale receipt
            const getLastWeight = () => {
                if (!pig.weightHistory || pig.weightHistory.length === 0) return null;
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
            }
        });
    }

    // Called when user picks status in dropdown
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

        // Sold requires a per-pig price flow — enforce single-pig update for 'sold'
        if (newStatus === 'sold' && selectedIds.length > 1) {
            showAlert("warning", "Please change 'Sold' status one pig at a time (price required).");
            return;
        }

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

        // Multiple pigs: allow bulk updates for statuses that don't require extra input
        const allowedBulk = ['growing', 'tosale', 'deceased'];
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
        if (!tabActionsDropdown || !tabsContainer) return;
        currentEditFarmId = Number(farmId);

        // compute position relative to tabsContainer
        const tabRect = tabEl.getBoundingClientRect();
        const containerRect = tabsContainer.getBoundingClientRect();

        // place dropdown under the tab
        tabActionsDropdown.style.left = Math.max(0, tabRect.left - containerRect.left) + 'px';
        tabActionsDropdown.style.top  = (tabRect.bottom - containerRect.top) + 'px';
        tabActionsDropdown.style.display = 'block';
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

    // Tab actions dropdown buttons
    if (tabRenameBtn) {
        tabRenameBtn.addEventListener('click', () => {
            if (tabActionsDropdown) tabActionsDropdown.style.display = 'none';
            openRenameFarmModalFor(currentEditFarmId);
        });
    }

    if (tabDeleteBtn) {
        tabDeleteBtn.addEventListener('click', () => {
            if (tabActionsDropdown) tabActionsDropdown.style.display = 'none';
            openDeleteFarmConfirmFor(currentEditFarmId);
        });
    }

    // hide dropdown when clicking anywhere else
    document.addEventListener('click', (e) => {
        if (!tabActionsDropdown) return;
        if (e.target.closest && e.target.closest('.tab')) return; // click on a tab
        if (e.target.closest && e.target.closest('.tab-actions-dropdown')) return; // click inside dropdown
        tabActionsDropdown.style.display = 'none';
    });

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

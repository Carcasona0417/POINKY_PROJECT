document.addEventListener('DOMContentLoaded', function() {

    // --- Initialize Variables (UPDATED) ---
    const selectAllCheckbox = document.getElementById('selectAll');
    const tableSelectAllCheckbox = document.getElementById('tableSelectAll');
    let pigCheckboxes = document.querySelectorAll('.pig-checkbox');
    const tabsContainer = document.querySelector('.tabs-header');
    const tabs = document.querySelectorAll('.tab');
    const tabAdd = document.querySelector('.tab-add');
    const filterItems = document.querySelectorAll('.filter-item');
    const dropdown = document.getElementById('statusDropdown');
    const dropdownToggle = dropdown?.querySelector('.dropdown-toggle');
    const dropdownItems = dropdown?.querySelectorAll('.dropdown-item');
    const searchInput = document.getElementById('searchInput');
    const pigsTableBody = document.getElementById('pigsTableBody');
    let pigRows = document.querySelectorAll('.pig-row');
    const addPigBtn = document.getElementById('addPigBtn');
    const notificationBtn = document.getElementById('notificationBtn');
    const activePigsCount = document.getElementById('activePigsCount');
    const showingCount = document.getElementById('showingCount');
    const totalCount = document.getElementById('totalCount');

    // Modal elements
    const addPigModal = document.getElementById('addPigModal');
    const notificationModal = document.getElementById('notificationModal');
    const addPigForm = document.getElementById('addPigForm');
    const detailsModal = document.getElementById('pigDetailsModal');
    const addWeightModal = document.getElementById('addWeightModal');
    const addWeightForm = document.getElementById('addWeightForm');
    const newWeightImgInput = document.getElementById('newWeightImg');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const btnOpenAddWeight = document.querySelector('.btn-add-record');
    const closeWeightModalBtn = document.getElementById('closeWeightModal');

    // 🆕 NEW: Expense and Vaccination Modal Elements
    const addExpenseModal = document.getElementById('addExpenseModal');
    const addExpenseForm = document.getElementById('addExpenseForm');
    const closeExpenseModalBtn = document.getElementById('closeExpenseModal');
    const clearExpenseFormBtn = document.getElementById('clearExpenseForm');
    const addExpenseBtn = document.getElementById('addExpenseBtn');

    const addVaccinationModal = document.getElementById('addVaccinationModal');
    const addVaccinationForm = document.getElementById('addVaccinationForm');
    const closeVaccinationModalBtn = document.getElementById('closeVaccinationModal');
    const clearVaccinationFormBtn = document.getElementById('clearVaccinationForm');
    const addVaccinationBtn = document.getElementById('addVaccinationBtn');

    // Sale Modal Elements
    const priceInputModal = document.getElementById('priceInputModal');
    const soldConfirmationModal = document.getElementById('soldConfirmationModal');
    const priceInputForm = document.getElementById('priceInputForm');
    const priceInput = document.getElementById('priceInput'); // User enters Price PER PIG
    const finalSoldPriceDisplay = document.getElementById('finalSoldPriceDisplay');
    const confirmSoldPriceBtn = document.getElementById('confirmSoldPrice');

    // Global State Variables (CRITICALLY UPDATED FOR BULK SALE)
    let currentPigsForSaleIds = []; // Stores IDs of ALL pigs selected for the bulk sale
    let calculatedTotalSalePrice = 0; // Total calculated price (Price Per Pig * Count)
    let pricePerPigInput = 0; // Price entered by the user (Price Per Pig)
    let currentPigForSaleId = null; // Unused in bulk flow, but kept for non-sale functions

    // Edit Weight Modal elements
    const editWeightModal = document.getElementById('editWeightModal');
    const editWeightForm = document.getElementById('editWeightForm');
    const editWeightImgInput = document.getElementById('editWeightImg');
    const editFileNameDisplay = document.getElementById('editFileNameDisplay');
    const closeEditWeightModalBtn = document.getElementById('closeEditWeightModal');
    const btnCancelEditWeight = document.getElementById('btnCancelEditWeight');

    // State Variables
    let currentDetailPigId = null;
    let currentEditWeightRecordIndex = null;

    // 🆕 NEW: Farm Context Menu Elements
    const farmContextMenu = document.getElementById('farmContextMenu');
    const renameFarmBtn = document.getElementById('renameFarmBtn');
    const deleteFarmBtn = document.getElementById('deleteFarmBtn');
    const renameFarmModal = document.getElementById('renameFarmModal');
    const renameFarmForm = document.getElementById('renameFarmForm');
    const newFarmNameInput = document.getElementById('newFarmName');
    const closeRenameFarmModal = document.getElementById('closeRenameFarmModal');
    const cancelRenameFarm = document.getElementById('cancelRenameFarm');

    let currentContextFarmId = null; // Track which farm is being edited

    // 🆕 New Pig Details Action Menu Elements
    const pigDetailsMenuIcon = document.getElementById('pigDetailsMenuIcon');
    const pigActionMenu = document.getElementById('pigActionMenu');
    const editPigDetailsBtn = document.getElementById('editPigDetailsBtn');
    const deletePigBtn = document.getElementById('deletePigBtn');
    
    // 🆕 New Edit Pig Details Modal Elements
    const editPigDetailsModal = document.getElementById('editPigDetailsModal');
    const closeEditPigDetailsModal = document.getElementById('closeEditPigDetailsModal');
    const cancelEditPigDetails = document.getElementById('cancelEditPigDetails');
    const editPigDetailsForm = document.getElementById('editPigDetailsForm');
    const editPigNameInput = document.getElementById('editPigName');
    const editPigBreedInput = document.getElementById('editPigBreed');
    const editPigGenderInput = document.getElementById('editPigGender');
    const editPigDateInput = document.getElementById('editPigDate');
    const editPigShortIdDisplay = document.getElementById('editPigShortIdDisplay');


    // Farm data storage - Start with initial data structure (UPDATED)
    let farms = [
        { id: 1, name: 'Farm 1', pigs: [] },
        { id: 2, name: 'Farm 2', pigs: [] },
        { id: 3, name: 'Farm 3', pigs: [] }
    ];

    let currentFarmId = 1;
    let nextFarmId = 4;
    let nextPigId = 1;

    // Helper: Get the current farm object
    const getCurrentFarm = () => farms.find(farm => farm.id === currentFarmId);
    
    // NEW Helper: Get a pig by ID from the current farm
    const getPigById = (pigId) => getCurrentFarm()?.pigs.find(p => p.id === pigId);
    
    // --- NEW HELPER FUNCTION TO FIND NEWEST WEIGHT ---
    /**
     * Finds the latest (newest) weight from the history based on date.
     * @param {Array<Object>} history - The pig's weightHistory array.
     * @returns {number} The newest weight value.
     */
    function getNewestWeight(history) {
        if (!history || history.length === 0) {
            return 0;
        }
        
        // Find the record with the most recent date
        const newestRecord = history.reduce((latest, record) => {
            const latestDate = new Date(latest.date || 0);
            const recordDate = new Date(record.date);
            
            // If the current record is newer, or if dates are equal, choose the heavier weight
            if (recordDate > latestDate) {
                return record;
            } else if (recordDate.getTime() === latestDate.getTime() && record.weight > latest.weight) {
                return record;
            }
            return latest;
        }, { date: '1970-01-01', weight: 0 }); // Use a very old date as starting point

        return newestRecord.weight;
    }

    // ✅ NEW VALIDATION FUNCTION: Checks for duplicate pig name (case-insensitive)
    function isDuplicatePigName(pigName) {
        const currentFarm = getCurrentFarm();
        if (!currentFarm) return false;
        // Check if any existing pig has the same name (case-insensitive)
        return currentFarm.pigs.some(pig => pig.name.toLowerCase() === pigName.toLowerCase());
    }

    // --- Helper & Modal Management (UPDATED) ---

    function formatStatusText(status) {
        const statusMap = {
            'growing': 'Growing',
            'tosale': 'To Sale',
            'sold': 'Sold',
            'deceased': 'Deceased'
        };
        return statusMap[status] || status;
    }

    /**
     * Closes all modals and resets the body overflow.
     * Also clears the sale state variables.
     */
    function closeAllModals() {
        const modals = document.querySelectorAll('.modal, .notification-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto'; // Back to page view

        // Always clear sale state when closing any sale modal
        currentPigsForSaleIds = [];
        calculatedTotalSalePrice = 0;
        pricePerPigInput = 0;
    }

    function openNotificationModal() {
        if (notificationModal) {
            notificationModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // --- Farm Management (UNCHANGED) ---
    function addNewFarm() {
        const newFarm = {
            id: nextFarmId,
            name: `Farm ${nextFarmId}`,
            pigs: []
        };

        farms.push(newFarm);

        const newTab = document.createElement('button');
        newTab.className = 'tab';
        newTab.setAttribute('role', 'tab');
        newTab.setAttribute('aria-selected', 'false');
        newTab.setAttribute('data-farm', newFarm.id);
        newTab.textContent = newFarm.name;

        // 🆕 ADD DOUBLE-CLICK EVENT LISTENER
        newTab.addEventListener('dblclick', function(e) {
            showFarmContextMenu(newFarm.id, e);
        });

        tabsContainer.insertBefore(newTab, tabAdd);

        newTab.addEventListener('click', function() {
            switchToFarm(newFarm.id);
        });

        switchToFarm(newFarm.id);
        nextFarmId++;
    }

    // 🆕 NEW: Farm Context Menu Event Listeners
    document.addEventListener('click', function(e) {
        if (!farmContextMenu.contains(e.target)) {
            hideFarmContextMenu();
        }
    });

    // Double-click event for existing farm tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('dblclick', function(e) {
            const farmId = parseInt(this.dataset.farm);
            showFarmContextMenu(farmId, e);
        });
    });

// 🆕 FIXED: Context menu button events
if (renameFarmBtn) {
    renameFarmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Rename button clicked, currentContextFarmId:', currentContextFarmId);
        
        if (!currentContextFarmId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No farm selected. Please try again.',
                showConfirmButton: true
            });
            return;
        }
        
        hideFarmContextMenu();
        openRenameFarmModal();
    });
}

if (deleteFarmBtn) {
    deleteFarmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Delete button clicked, currentContextFarmId:', currentContextFarmId);
        
        if (currentContextFarmId) {
            hideFarmContextMenu();
            deleteFarm(currentContextFarmId);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No farm selected. Please try again.',
                showConfirmButton: true
            });
        }
    });
}

// Fix for Rename Farm Form
if (renameFarmForm) {
    renameFarmForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        if (!currentContextFarmId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No farm selected. Please try again.',
                showConfirmButton: true
            });
            return;
        }
        
        const newName = newFarmNameInput.value.trim();
        
        if (!newName) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Name',
                text: 'Please enter a farm name.',
                showConfirmButton: true,
                confirmButtonColor: '#dc2626'
            });
            newFarmNameInput.focus();
            return;
        }
        
        // Call the rename function
        renameFarm(currentContextFarmId, newName);
    });
}

if (closeRenameFarmModal) {
    closeRenameFarmModal.addEventListener('click', function() {
        renameFarmModal.style.display = 'none';
        currentContextFarmId = null; // 🆕 Reset here too
    });
}

if (cancelRenameFarm) {
    cancelRenameFarm.addEventListener('click', function() {
        renameFarmModal.style.display = 'none';
        currentContextFarmId = null; // 🆕 Reset here too
    });
}

    const clearAddPigFormBtn = document.getElementById('clearAddPigForm');

    if (clearAddPigFormBtn) {
        clearAddPigFormBtn.addEventListener('click', function() {
            addPigForm.reset();
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('pigDate').value = today; // Reset date to today
        });
    }

    // Close rename modal when clicking outside
    renameFarmModal.addEventListener('click', function(e) {
        if (e.target === renameFarmModal) {
            renameFarmModal.style.display = 'none';
        }
    });


    function switchToFarm(farmId) {
        tabs.forEach(tab => tab.classList.remove('active'));
        const currentTab = document.querySelector(`.tab[data-farm="${farmId}"]`);
        if (currentTab) {
            currentTab.classList.add('active');
        }

        currentFarmId = farmId;
        loadFarmData(farmId);
    }

    // --- Pig Management (UPDATED) ---

    function openAddPigModal() {
        if (addPigModal) {
            addPigModal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('pigDate').value = today;

            document.getElementById('pigName').focus();
        }
    }

    function addNewPig(pigData) {
        const currentFarm = getCurrentFarm();
        if (!currentFarm) return;

        const initialWeight = parseFloat(pigData.initialWeight);

        const newPig = {
            id: nextPigId,
            ...pigData,
            shortId: pigData.name.substring(0, 3).toUpperCase(),
            age: `${pigData.age} mo.`,
            weight: `${initialWeight}kg`,
            status: 'growing',
            weightHistory: [{
                date: pigData.date,
                weight: initialWeight,
                img: 'Dash Icons/WPig.png'
            }],
            // 🆕 NEW: Initialize expense and vaccination records
            expenseRecords: [],
            vaccinationRecords: [],
            medicalRecords: [],
            statusHistory: [{
                date: pigData.date,
                status: 'growing',
                notes: 'Initial registration.'
            }]
        };

        currentFarm.pigs.push(newPig);
        nextPigId++;

        loadFarmData(currentFarmId);
    }

function createPigRow(pig) {
    const row = document.createElement('tr');
    row.className = `pig-row ${pig.status === 'sold' || pig.status === 'deceased' ? 'inactive' : ''}`;
    row.setAttribute('data-id', pig.id);
    row.setAttribute('data-status', pig.status);

    const isInactive = pig.status === 'sold' || pig.status === 'deceased';
    // Determine the class and the onclick attribute based on the status
    const badgeClass = isInactive ? 'pig-id-badge' : 'pig-id-badge clickable-badge';
    const onClickAttribute = isInactive ? '' : `onclick="openPigDetails(${pig.id})"`;

    row.innerHTML = `
        <td class="col-checkbox">
            <input type="checkbox" class="pig-checkbox" data-pig-id="${pig.id}" ${isInactive ? 'disabled' : ''}>
        </td>
        <td class="col-name">
            <span class="${badgeClass}" ${onClickAttribute}>
                ${pig.shortId}
            </span>
        </td>
        <td class="col-age">${pig.age}</td>
        <td class="col-weight">${pig.weight}</td>
        <td class="col-gender">
            <i class="fa-solid fa-${pig.gender === 'female' ? 'venus' : 'mars'} gender-icon ${pig.gender}"></i>
            ${pig.gender === 'female' ? 'Female' : 'Male'}
        </td>
        <td class="col-status">
            <span class="status-badge status-${pig.status}">${formatStatusText(pig.status)}</span>
        </td>
    `;

    return row;
}

    function loadFarmData(farmId) {
        const currentFarm = getCurrentFarm();
        if (!currentFarm) return;

        pigsTableBody.innerHTML = '';

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

        pigCheckboxes = document.querySelectorAll('.pig-checkbox');
        pigRows = document.querySelectorAll('.pig-row');
        setupSelectAllCheckbox(selectAllCheckbox, pigCheckboxes);
        setupSelectAllCheckbox(tableSelectAllCheckbox, pigCheckboxes);
        updatePigCounts();
        updateFilterCounts();
    }


    // --- 🐷 Pig Details & Weight Management Functions (UPDATED) ---

    // Expose to window for inline HTML calls (like from createPigRow)
    window.openPigDetails = function(pigId) {
        const pig = getCurrentFarm()?.pigs.find(p => p.id === pigId);

        if (!pig) return;
        currentDetailPigId = pigId;

        document.getElementById('detailName').textContent = pig.name;
        document.getElementById('detailBreed').textContent = pig.breed;
        document.getElementById('detailGender').textContent = pig.gender.charAt(0).toUpperCase() + pig.gender.slice(1);
        document.getElementById('detailDate').textContent = pig.date;
        document.getElementById('detailInitialWeight').textContent = (pig.weightHistory[0]?.weight || '0') + ' kg';
        
        // Use getNewestWeight to ensure the current weight is accurate
        const currentWeight = getNewestWeight(pig.weightHistory);
        document.getElementById('detailCurrentWeight').textContent = `${currentWeight} kg`;
        
        document.getElementById('detailStatus').textContent = formatStatusText(pig.status);

        // Reset and set active tab to Weight
        document.querySelectorAll('.detail-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`.detail-tab[data-tab="weight"]`)?.classList.add('active');

        updateDetailsTabContent(pig, 'weight');

        detailsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    function updateDetailsTabContent(pig, tabId) {
        document.querySelectorAll('.details-main .tab-content').forEach(c => c.style.display = 'none');

        const content = document.getElementById(`tab-${tabId}`);
        if (!content) return;

        content.style.display = 'block';

        if (tabId === 'weight') {
            const tbody = document.getElementById('weightRecordsBody');
            tbody.innerHTML = '';

            if (pig.weightHistory && pig.weightHistory.length > 0) {
                // Sort records by date descending (newest first)
                const sortedHistory = pig.weightHistory.slice().sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    
                    if (dateB.getTime() !== dateA.getTime()) {
                        return dateB - dateA; // Sort by date descending
                    }
                    return b.weight - a.weight; // If dates are the same, heavier weight comes first
                });
                
                // Find the newest record's values to determine which one is editable
                const newestRecordInHistory = getNewestWeightRecord(pig.weightHistory);
                
                const totalRecords = pig.weightHistory.length;

                sortedHistory.forEach((rec) => {
                    // Find the original index for the action buttons
                    const originalIndex = pig.weightHistory.findIndex(r => r.date === rec.date && r.weight === rec.weight);
                    
                    const tr = document.createElement('tr');
                    
                    const dateObj = new Date(rec.date);
                    const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    
                    let actionIconHTML = '';
                    
                    // The newest record in the history is the one with the latest date/weight, 
                    // which is now the first item in the sortedHistory array.
                    if (rec === sortedHistory[0]) {
                        // Use the original index from the unsorted array for editing
                        actionIconHTML = `<i class="fas fa-edit action-icon edit-icon" data-record-index="${originalIndex}"></i>`;
                    } else {
                        actionIconHTML = `<i class="fas fa-trash-alt action-icon delete-icon" data-record-index="${originalIndex}"></i>`;
                    }

                    tr.innerHTML = `
                        <td>${dateString}</td>
                        <td>${rec.weight} kg</td>
                        <td class="record-actions">
                            <img src="${rec.img}" class="pig-thumb" alt="pig">
                            ${actionIconHTML}
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                // Attach event listeners to the new icons
                tbody.querySelectorAll('.edit-icon').forEach(icon => {
                    icon.addEventListener('click', function() {
                        // ✅ FIX: Changed 'record-index' to 'recordIndex' for dataset access
                        const index = parseInt(this.dataset.recordIndex); 
                        openEditWeightModal(index);
                    });
                });
                tbody.querySelectorAll('.delete-icon').forEach(icon => {
                    icon.addEventListener('click', function() {
                        // ✅ FIX: Changed 'record-index' to 'recordIndex' for dataset access
                        const index = parseInt(this.dataset.recordIndex); 
                        deleteWeightRecord(index);
                    });
                });

            } else {
                tbody.innerHTML = '<tr><td colspan="3">No weight records found.</td></tr>';
            }
        }

        // 🆕 NEW: Expenses Tab Content (FIXED)
        else if (tabId === 'expenses') {
            const tbody = document.getElementById('expensesRecordsBody');
            tbody.innerHTML = '';

            if (pig.expenseRecords && pig.expenseRecords.length > 0) {
                // 🆕 FIRST: Filter out any invalid records
                const validExpenses = pig.expenseRecords.filter(expense => 
                    expense.date && 
                    !isNaN(expense.price) && 
                    expense.price > 0 &&
                    expense.category
                );

                if (validExpenses.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3">No valid expense records found.</td></tr>';
                    return;
                }

                // Sort valid expenses by date descending (newest first)
                const sortedExpenses = validExpenses.slice().sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                });

                sortedExpenses.forEach((expense, index) => {
                    const tr = document.createElement('tr');
                    
                    // 🆕 FIX: Proper date formatting with error handling
                    let dateString = 'Invalid Date';
                    try {
                        const dateObj = new Date(expense.date);
                        if (!isNaN(dateObj.getTime())) {
                            dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }
                    } catch (e) {
                        console.warn('Invalid date:', expense.date);
                    }
                    
                    // 🆕 FIX: Proper price formatting with error handling
                    let priceString = 'Invalid Price';
                    if (!isNaN(expense.price) && expense.price > 0) {
                        priceString = `₱${expense.price.toFixed(2)}`;
                    }
                    
                    tr.innerHTML = `
                        <td>${dateString}</td>
                        <td>${priceString}</td>
                        <td>${expense.category || 'Uncategorized'}</td>
                    `;
                    tbody.appendChild(tr);
                });

                // 🆕 OPTIONAL: Clean up the original data by removing invalid records
                if (validExpenses.length < pig.expenseRecords.length) {
                    pig.expenseRecords = validExpenses;
                }
                
            } else {
                tbody.innerHTML = '<tr><td colspan="3">No expense records found.</td></tr>';
            }
        }

        // 🆕 NEW: Health/Vaccination Tab Content (FIXED)
        else if (tabId === 'health') {
            const tbody = document.getElementById('vaccinationRecordsBody');
            tbody.innerHTML = '';

            if (pig.vaccinationRecords && pig.vaccinationRecords.length > 0) {
                // 🆕 FIRST: Filter out any invalid records
                const validVaccinations = pig.vaccinationRecords.filter(vaccination => 
                    vaccination.date && 
                    vaccination.dueDate && 
                    vaccination.type
                );

                if (validVaccinations.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4">No valid vaccination records found.</td></tr>';
                    return;
                }

                // Sort valid vaccinations by date descending (newest first)
                const sortedVaccinations = validVaccinations.slice().sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                });

                sortedVaccinations.forEach((vaccination, index) => {
                    const tr = document.createElement('tr');
                    
                    // 🆕 FIX: Proper date formatting with error handling
                    let dateString = 'Invalid Date';
                    let dueDateString = 'Invalid Date';
                    try {
                        const dateObj = new Date(vaccination.date);
                        if (!isNaN(dateObj.getTime())) {
                            dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }
                        
                        const dueDateObj = new Date(vaccination.dueDate);
                        if (!isNaN(dueDateObj.getTime())) {
                            dueDateString = dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }
                    } catch (e) {
                        console.warn('Invalid date in vaccination record:', vaccination.date, vaccination.dueDate);
                    }
                    
                    // 🆕 FIX: Determine status with proper error handling
                    let status = 'Done';
                    let statusClass = 'status-done';
                    
                    try {
                        const today = new Date();
                        const dueDate = new Date(vaccination.dueDate);
                        
                        if (!isNaN(dueDate.getTime())) {
                            if (dueDate < today) {
                                status = 'Overdue';
                                statusClass = 'status-overdue';
                            } else if (dueDate > today) {
                                status = 'Due';
                                statusClass = 'status-due';
                            }
                        } else {
                            status = 'Invalid Date';
                            statusClass = 'status-overdue';
                        }
                    } catch (e) {
                        status = 'Error';
                        statusClass = 'status-overdue';
                    }

                    tr.innerHTML = `
                        <td>${dateString}</td>
                        <td>${dueDateString}</td>
                        <td>${vaccination.type || 'Unknown Type'}</td>
                        <td><span class="status-badge ${statusClass}">${status}</span></td>
                    `;
                    tbody.appendChild(tr);
                });

                // 🆕 OPTIONAL: Clean up the original data by removing invalid records
                if (validVaccinations.length < pig.vaccinationRecords.length) {
                    pig.vaccinationRecords = validVaccinations;
                }
                
            } else {
                tbody.innerHTML = '<tr><td colspan="4">No vaccination records found.</td></tr>';
            }
        }

        // Update the add button based on active tab
        if (tabId === 'weight') {
            btnOpenAddWeight.textContent = 'Add Weight Record';
            btnOpenAddWeight.onclick = openAddWeightModal;
            btnOpenAddWeight.style.display = 'inline-block';
        } else if (tabId === 'expenses') {
            btnOpenAddWeight.textContent = 'Add Expenses';
            btnOpenAddWeight.onclick = openAddExpenseModal;
            btnOpenAddWeight.style.display = 'inline-block';
        } else if (tabId === 'health') {
            btnOpenAddWeight.textContent = 'Add Vaccination';
            btnOpenAddWeight.onclick = openAddVaccinationModal;
            btnOpenAddWeight.style.display = 'inline-block';
        } else {
            btnOpenAddWeight.style.display = 'none';
        }
    }

// 🆕 ENHANCED CLEANUP FUNCTION FOR BOTH EXPENSE AND VACCINATION RECORDS
function cleanupInvalidRecords() {
    const currentFarm = getCurrentFarm();
    if (currentFarm) {
        currentFarm.pigs.forEach(pig => {
            // Clean up expense records
            if (pig.expenseRecords && pig.expenseRecords.length > 0) {
                const originalExpenseCount = pig.expenseRecords.length;
                pig.expenseRecords = pig.expenseRecords.filter(expense => 
                    expense.date && 
                    !isNaN(expense.price) && 
                    expense.price > 0 &&
                    expense.category
                );
                if (pig.expenseRecords.length !== originalExpenseCount) {
                    console.log(`Cleaned ${originalExpenseCount - pig.expenseRecords.length} invalid expense records from pig ${pig.id}`);
                }
            }
            
            // 🆕 Clean up vaccination records
            if (pig.vaccinationRecords && pig.vaccinationRecords.length > 0) {
                const originalVaccinationCount = pig.vaccinationRecords.length;
                pig.vaccinationRecords = pig.vaccinationRecords.filter(vaccination => 
                    vaccination.date && 
                    vaccination.dueDate && 
                    vaccination.type
                );
                if (pig.vaccinationRecords.length !== originalVaccinationCount) {
                    console.log(`Cleaned ${originalVaccinationCount - pig.vaccinationRecords.length} invalid vaccination records from pig ${pig.id}`);
                }
            }
        });
        loadFarmData(currentFarmId);
    }
}

// 🆕 CALL THIS ONCE TO CLEAN EXISTING DATA
cleanupInvalidRecords();
    
    /**
     * Finds the newest weight record object in the history based on date.
     * @param {Array<Object>} history - The pig's weightHistory array.
     * @returns {Object|null} The newest record object or null.
     */
    function getNewestWeightRecord(history) {
        if (!history || history.length === 0) {
            return null;
        }
        
        return history.reduce((latest, record) => {
            const latestDate = new Date(latest.date || 0);
            const recordDate = new Date(record.date);
            
            // Prioritize date, then weight if dates are equal
            if (recordDate > latestDate) {
                return record;
            } else if (recordDate.getTime() === latestDate.getTime() && record.weight > latest.weight) {
                return record;
            }
            return latest;
        }, { date: '1970-01-01', weight: 0 });
    }

    // =========================================================================
    // 🆕 EXPENSE AND VACCINATION MODAL FUNCTIONS
    // =========================================================================

    function openAddExpenseModal() {
        if (!currentDetailPigId) return;
        detailsModal.style.display = 'none';
        addExpenseModal.style.display = 'flex';

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newExpenseDate').value = today;
    }

    function openAddVaccinationModal() {
        if (!currentDetailPigId) return;
        detailsModal.style.display = 'none';
        addVaccinationModal.style.display = 'flex';

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newVaccinationDate').value = today;
        
        // Set due date to 30 days from today by default
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('newVaccinationDueDate').value = dueDate.toISOString().split('T')[0];
    }

    // =========================================================================
    // 🆕 PIG DETAILS EDIT/DELETE FUNCTIONS
    // =========================================================================

    function openEditPigDetailsModal() {
        if (!currentDetailPigId) return;

        const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);
        if (!pig) return;

        // 1. Populate the form fields with the current pig data
        editPigNameInput.value = pig.name;
        editPigGenderInput.value = pig.gender;
        editPigDateInput.value = pig.date;
        editPigShortIdDisplay.textContent = `Editing: ${pig.shortId} (${pig.name})`;

        // 🆕 UPDATED: Set the breed dropdown value
        const breedSelect = document.getElementById('editPigBreed');
        if (breedSelect) {
            breedSelect.value = pig.breed;
            // If the breed isn't in the options, set it to "Other"
            if (!breedSelect.querySelector(`option[value="${pig.breed}"]`)) {
                breedSelect.value = 'Other';
            }
        }

        // 2. Open the modal
        detailsModal.style.display = 'none';
        editPigDetailsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

function handleEditPigDetailsSubmit() {
    if (!currentDetailPigId) return;
    const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);
    if (!pig) return;

    const newName = editPigNameInput.value.trim();
    const newBreed = document.getElementById('editPigBreed').value; // 🆕 Get from dropdown

    // 1. Check for duplicate name against all OTHER pigs
    const isDuplicate = getCurrentFarm().pigs.some(p => 
        p.id !== currentDetailPigId && p.name.toLowerCase() === newName.toLowerCase()
    );

    if (isDuplicate) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Name',
            text: 'A pig with this name already exists in this farm.',
            showConfirmButton: true
        });
        return;
    }

    // 2. Update the pig object
    pig.name = newName;
    pig.breed = newBreed; // 🆕 Updated breed from dropdown
    pig.gender = editPigGenderInput.value;
    pig.date = editPigDateInput.value;
    
    // Re-generate derived fields
    pig.shortId = pig.name.substring(0, 3).toUpperCase();
    
    // 3. Close modal and refresh UI
    editPigDetailsModal.style.display = 'none';
    loadFarmData(currentFarmId);
    
    // Re-open the details modal with the new info
    window.openPigDetails(pig.id); 

    Swal.fire({
        icon: 'success',
        title: 'Details Updated!',
        text: `${pig.name}'s details have been successfully saved.`,
        showConfirmButton: false,
        timer: 2000
    });
}

    function deletePig(pigId) {
        if (!pigId) return;

        Swal.fire({
            title: 'Delete Pig?',
            text: "You are about to permanently remove this pig record. This cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#4CAF50',
            confirmButtonText: 'Yes, Delete It',
            customClass: {
                popup: 'swal2-high-zindex'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const currentFarm = getCurrentFarm();
                if (currentFarm) {
                    // Find the index of the pig to remove
                    const pigIndex = currentFarm.pigs.findIndex(p => p.id === pigId);
                    
                    if (pigIndex > -1) {
                        currentFarm.pigs.splice(pigIndex, 1); // Remove pig from the array

                        closeAllModals(); // Close the details modal
                        loadFarmData(currentFarmId); // Refresh the table

                        Swal.fire('Deleted!', 'The pig record has been successfully removed.', 'success');
                    }
                }
            }
        });
    }

    // =========================================================================
    // END PIG DETAILS EDIT/DELETE FUNCTIONS
    // =========================================================================


    // --- Add Weight Modal Logic (UNCHANGED) ---
    function openAddWeightModal() {
        if (!currentDetailPigId) return;
        detailsModal.style.display = 'none';
        addWeightModal.style.display = 'flex';

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newWeightDate').value = today;

        fileNameDisplay.textContent = 'Upload Image';
        fileNameDisplay.style.color = 'var(--text-light)';
        fileNameDisplay.style.fontStyle = 'italic';
        document.getElementById('newWeightImg').value = '';
    }

    // 🆕 NEW: Open Expense Modal Function
function openAddExpenseModal() {
    if (!currentDetailPigId) return;
    detailsModal.style.display = 'none';
    addExpenseModal.style.display = 'flex';

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('newExpenseDate').value = today;
}

// 🆕 NEW: Open Vaccination Modal Function
function openAddVaccinationModal() {
    if (!currentDetailPigId) return;
    detailsModal.style.display = 'none';
    addVaccinationModal.style.display = 'flex';

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('newVaccinationDate').value = today;
    
    // Set due date to 30 days from today by default
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('newVaccinationDueDate').value = dueDate.toISOString().split('T')[0];
}

// 🆕 NEW: Expense and Vaccination Button Listeners
if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', openAddExpenseModal);
}

if (addVaccinationBtn) {
    addVaccinationBtn.addEventListener('click', openAddVaccinationModal);
}

// 🆕 NEW: Expense Modal Close Listeners
if(closeExpenseModalBtn) {
    closeExpenseModalBtn.addEventListener('click', function() {
        addExpenseModal.style.display = 'none';
        detailsModal.style.display = 'flex';
    });
}

// 🆕 NEW: Vaccination Modal Close Listeners
if(closeVaccinationModalBtn) {
    closeVaccinationModalBtn.addEventListener('click', function() {
        addVaccinationModal.style.display = 'none';
        detailsModal.style.display = 'flex';
    });
}

// 🆕 NEW: Clear Form Buttons
if (clearExpenseFormBtn) {
    clearExpenseFormBtn.addEventListener('click', function() {
        addExpenseForm.reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newExpenseDate').value = today;
    });
}

if (clearVaccinationFormBtn) {
    clearVaccinationFormBtn.addEventListener('click', function() {
        addVaccinationForm.reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newVaccinationDate').value = today;
        
        // Reset due date to 30 days from today
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('newVaccinationDueDate').value = dueDate.toISOString().split('T')[0];
    });
}


// 🆕 NEW: Add Expense Form Handler (UPDATED)
if (addExpenseForm) {
    addExpenseForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const dateVal = document.getElementById('newExpenseDate').value;
        const priceVal = document.getElementById('newExpensePrice').value;
        const categoryVal = document.getElementById('newExpenseCategory').value;

        if (!dateVal || !priceVal || !categoryVal) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter all expense details.',
                showConfirmButton: true,
                confirmButtonColor: '#dc2626'
            });
            return;
        }

        // 🆕 ADD VALIDATION: Check if price is a valid number
        const priceNumber = parseFloat(priceVal);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Price',
                text: 'Please enter a valid price amount.',
                showConfirmButton: true,
                confirmButtonColor: '#dc2626'
            });
            return;
        }

        const currentFarm = getCurrentFarm();
        const pig = currentFarm.pigs.find(p => p.id === currentDetailPigId);
        if (pig) {
            const newExpense = {
                date: dateVal,
                price: priceNumber, // Use the validated number
                category: categoryVal
            };

            // Initialize expenseRecords array if it doesn't exist
            if (!pig.expenseRecords) {
                pig.expenseRecords = [];
            }

            pig.expenseRecords.push(newExpense);

            // 🆕 RESET THE FORM FIRST before showing success
            addExpenseForm.reset();
            
            // Set today's date after reset
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('newExpenseDate').value = today;

            addExpenseModal.style.display = 'none';
            detailsModal.style.display = 'flex';
            
            // Update the expenses tab content
            updateDetailsTabContent(pig, 'expenses');
            
            // 🆕 UPDATED: Use SweetAlert instead of alert
            showExpenseSuccessAlert();
            
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Pig not found. Please try again.',
                showConfirmButton: true,
                confirmButtonColor: '#dc2626'
            });
            addExpenseModal.style.display = 'none';
        }
    });
}

// 🆕 NEW: Add Vaccination Form Handler (UPDATED)
// 🆕 NEW: Add Vaccination Form Handler (UPDATED)
if (addVaccinationForm) {
    addVaccinationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const dateVal = document.getElementById('newVaccinationDate').value;
        const dueDateVal = document.getElementById('newVaccinationDueDate').value;
        const typeVal = document.getElementById('newVaccinationType').value;

        if (!dateVal || !dueDateVal || !typeVal) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter all vaccination details.',
                showConfirmButton: true,
                confirmButtonColor: '#dc2626'
            });
            return;
        }

        const currentFarm = getCurrentFarm();
        const pig = currentFarm.pigs.find(p => p.id === currentDetailPigId);
        if (pig) {
            const newVaccination = {
                date: dateVal,
                dueDate: dueDateVal,
                type: typeVal
            };

            // Initialize vaccinationRecords array if it doesn't exist
            if (!pig.vaccinationRecords) {
                pig.vaccinationRecords = [];
            }

            pig.vaccinationRecords.push(newVaccination);

            // 🆕 RESET THE FORM FIRST before showing success
            addVaccinationForm.reset();
            
            // Set today's date and due date after reset
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('newVaccinationDate').value = today;
            
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            document.getElementById('newVaccinationDueDate').value = dueDate.toISOString().split('T')[0];

            addVaccinationModal.style.display = 'none';
            detailsModal.style.display = 'flex';
            
            // Update the health tab content
            updateDetailsTabContent(pig, 'health');
            
            // 🆕 UPDATED: Use SweetAlert instead of alert
            showVaccinationSuccessAlert();
            
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Pig not found. Please try again.',
                showConfirmButton: true,
                confirmButtonColor: '#dc2626'
            });
            addVaccinationModal.style.display = 'none';
        }
    });
}

// Temporary cleanup - add this at the bottom of your DOMContentLoaded function
setTimeout(() => {
    const currentFarm = getCurrentFarm();
    if (currentFarm) {
        let cleaned = false;
        currentFarm.pigs.forEach(pig => {
            if (pig.expenseRecords) {
                const originalLength = pig.expenseRecords.length;
                pig.expenseRecords = pig.expenseRecords.filter(expense => 
                    expense.date && expense.date !== 'Invalid Date' && 
                    !isNaN(expense.price) && expense.price > 0
                );
                if (pig.expenseRecords.length !== originalLength) {
                    cleaned = true;
                }
            }
        });
        if (cleaned) {
            loadFarmData(currentFarmId);
        }
    }
}, 1000);

// 🆕 ADD THESE SUCCESS ALERT FUNCTIONS:
function showExpenseSuccessAlert() {
    Swal.fire({
        title: 'Success!',
        text: 'Expense record added successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4CAF50',
        customClass: {
            popup: 'swal2-high-zindex'
        }
    });
}

function showVaccinationSuccessAlert() {
    Swal.fire({
        title: 'Success!',
        text: 'Vaccination record added successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4CAF50',
        customClass: {
            popup: 'swal2-high-zindex'
        }
    });
}


    // --- Edit Weight Modal Logic (UNCHANGED) ---
    function openEditWeightModal(recordIndex) {
        if (!currentDetailPigId) return;

        const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);

        if (!pig || !pig.weightHistory || recordIndex >= pig.weightHistory.length) return;

        currentEditWeightRecordIndex = recordIndex;
        const recordToEdit = pig.weightHistory[recordIndex];

        // Populate the form with existing data
        document.getElementById('editWeightDate').value = recordToEdit.date;
        document.getElementById('editWeightValue').value = recordToEdit.weight;

        // Handle image display
        const isDefaultImage = recordToEdit.img.includes('Dash Icons/WPig.png');
        editFileNameDisplay.textContent = isDefaultImage ? 'Upload Image' : 'Current Image';
        editFileNameDisplay.style.color = isDefaultImage ? 'var(--text-light)' : '#333';
        editFileNameDisplay.style.fontStyle = isDefaultImage ? 'italic' : 'normal';
        editWeightImgInput.value = '';

        detailsModal.style.display = 'none';
        editWeightModal.style.display = 'flex';
    }

    // --- 🗑️ DELETE WEIGHT RECORD LOGIC (UNCHANGED) ---
    function deleteWeightRecord(recordIndex) {
        if (!currentDetailPigId) return;

        const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);

        if (!pig || !pig.weightHistory || recordIndex >= pig.weightHistory.length) return;

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this record!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#4CAF50',
            confirmButtonText: 'Yes, delete it!',
            // FIX: Uses custom class for high z-index to show SweetAlert over the Modal
            customClass: {
                popup: 'swal2-high-zindex'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // 1. Remove the record from the array
                pig.weightHistory.splice(recordIndex, 1);

                // 2. Determine the new current weight using the robust function
                const newCurrentWeight = getNewestWeight(pig.weightHistory);
                pig.weight = `${newCurrentWeight}kg`;


                // 3. Refresh UI
                updateDetailsTabContent(pig, 'weight');
                loadFarmData(currentFarmId);

                Swal.fire(
                    'Deleted!',
                    'The weight record has been removed.',
                    'success'
                );
            }
        });
    }

    // --- Form Handlers (UPDATED) ---

    // Add Pig Form
    if (addPigForm) {
        addPigForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // --- 1. Collect Data ---
            const pigName = document.getElementById('pigName').value.trim(); // Get name separately for validation
            const pigData = {
                name: pigName,
                breed: document.getElementById('pigBreed').value,
                gender: document.getElementById('pigGender').value,
                age: document.getElementById('pigAge').value, 
                date: document.getElementById('pigDate').value,
                initialWeight: document.getElementById('pigWeight').value
            };

            // --- 2. Check for Required Fields ---
            if (Object.values(pigData).every(val => val !== '' && val !== null)) {
                
                // 🛑 NEW VALIDATION CHECK for Duplicate Pig Name
                if (isDuplicatePigName(pigName)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid Entry',
                        text: 'A pig with the name "' + pigName + '" already exists in this farm. Pig names must be unique.',
                        showConfirmButton: true
                    });
                    return; // Stop form submission
                }
                // ------------------------------------
                
                // --- 3. CRITICAL: Save the pig data ---
                addNewPig(pigData); // <-- This saves the pig to the 'farms' array
                
                // --- 4. SUCCESS UI Sequence ---
                closeAllModals(); 
                openSuccessModal(); // <-- This opens the success pop-up

                // Reset the form and set the date
                this.reset();
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('pigDate').value = today;

                // Automatically close success modal after a few seconds
                setTimeout(() => {
                    closeAllModals(); 
                }, 2000); 

            } else {
                // This runs if any field is empty
                alert('Please fill out all fields.');
            }
        });
    }

    // 🆕 NEW: Add Expense Form Handler
    if (addExpenseForm) {
        addExpenseForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const dateVal = document.getElementById('newExpenseDate').value;
            const priceVal = document.getElementById('newExpensePrice').value;
            const categoryVal = document.getElementById('newExpenseCategory').value;

            const currentFarm = getCurrentFarm();
            const pig = currentFarm.pigs.find(p => p.id === currentDetailPigId);
            if (pig) {
                const newExpense = {
                    date: dateVal,
                    price: parseFloat(priceVal),
                    category: categoryVal
                };

                // Initialize expenseRecords array if it doesn't exist
                if (!pig.expenseRecords) {
                    pig.expenseRecords = [];
                }

                pig.expenseRecords.push(newExpense);

                addExpenseModal.style.display = 'none';
                detailsModal.style.display = 'flex';
                // Update the expenses tab content
                updateDetailsTabContent(pig, 'expenses');
                
                addExpenseForm.reset();
            } else {
                 alert('Error: Pig not found.');
                 addExpenseModal.style.display = 'none';
            }
        });
    }

    // 🆕 NEW: Add Vaccination Form Handler
    if (addVaccinationForm) {
        addVaccinationForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const dateVal = document.getElementById('newVaccinationDate').value;
            const dueDateVal = document.getElementById('newVaccinationDueDate').value;
            const typeVal = document.getElementById('newVaccinationType').value;

            const currentFarm = getCurrentFarm();
            const pig = currentFarm.pigs.find(p => p.id === currentDetailPigId);
            if (pig) {
                const newVaccination = {
                    date: dateVal,
                    dueDate: dueDateVal,
                    type: typeVal
                };

                // Initialize vaccinationRecords array if it doesn't exist
                if (!pig.vaccinationRecords) {
                    pig.vaccinationRecords = [];
                }

                pig.vaccinationRecords.push(newVaccination);

                addVaccinationModal.style.display = 'none';
                detailsModal.style.display = 'flex';
                // Update the health tab content
                updateDetailsTabContent(pig, 'health');
                
                addVaccinationForm.reset();
            } else {
                 alert('Error: Pig not found.');
                 addVaccinationModal.style.display = 'none';
            }
        });
    }

    function openSuccessModal() {
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Add Weight Form
if(addWeightForm) {
    addWeightForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const dateVal = document.getElementById('newWeightDate').value;
        const weightVal = document.getElementById('newWeightValue').value;

        if (!dateVal || !weightVal) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter a date and weight.',
                showConfirmButton: true,
                confirmButtonColor: '#dc2626'
            });
            return;
        }

        const currentFarm = getCurrentFarm();
        const pig = currentFarm.pigs.find(p => p.id === currentDetailPigId);
        if (pig) {
            const newRecord = {
                date: dateVal,
                weight: parseFloat(weightVal),
                img: newWeightImgInput.files && newWeightImgInput.files[0] ? URL.createObjectURL(newWeightImgInput.files[0]) : 'Dash Icons/WPig.png'
            };

            pig.weightHistory.push(newRecord);
            
            // Update the pig's current weight using the new helper
            const newCurrentWeight = getNewestWeight(pig.weightHistory);
            pig.weight = `${newCurrentWeight}kg`;

            addWeightModal.style.display = 'none';
            detailsModal.style.display = 'flex';
            
            // Show success message with SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'Weight Added!',
                text: `Weight record has been successfully added.`,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            
            // Call openPigDetails to ensure the detail sidebar is updated
            window.openPigDetails(pig.id); 
            
            addWeightForm.reset();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Pig not found. Please try again.',
                showConfirmButton: true,
                confirmButtonColor: '#dc2626'
            });
            addWeightModal.style.display = 'none';
        }
    });
}

// Edit Weight Form
if (editWeightForm) {
    editWeightForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const dateVal = document.getElementById('editWeightDate').value;
        const weightVal = document.getElementById('editWeightValue').value;

        if (!dateVal || !weightVal) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter a date and weight.',
                showConfirmButton: true,
                confirmButtonColor: '#dc2626'
            });
            return;
        }

        const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);

        if (pig && currentEditWeightRecordIndex !== null) {
            const editedRecord = pig.weightHistory[currentEditWeightRecordIndex];
            editedRecord.date = dateVal;
            editedRecord.weight = parseFloat(weightVal);

            if (editWeightImgInput.files && editWeightImgInput.files[0]) {
                editedRecord.img = URL.createObjectURL(editWeightImgInput.files[0]);
            }

            // Recalculate and update current weight based on newest date
            const newCurrentWeight = getNewestWeight(pig.weightHistory);
            pig.weight = `${newCurrentWeight}kg`;
            
            editWeightModal.style.display = 'none';
            detailsModal.style.display = 'flex';
            
            // Show success message with SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'Weight Updated!',
                text: `Weight record has been successfully updated.`,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            
            // Call openPigDetails to ensure the detail sidebar is updated with the new current weight
            window.openPigDetails(pig.id); 
            
            this.reset();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could not save changes. Please try again.',
                showConfirmButton: true,
                confirmButtonColor: '#dc2626'
            });
        }
        currentEditWeightRecordIndex = null;
    });
}

// --- Event Listeners for UI interaction (Modals, Tabs, Filters) (UPDATED) ---

// Modal Close Listeners (Updated to be less aggressive and rely on specific handlers where possible)
document.addEventListener('click', function(e) {
    // Only trigger closeAllModals if clicking the backdrop or the close button doesn't have a specific handler
    if (e.target.classList.contains('modal') || e.target.classList.contains('notification-modal')) {
         closeAllModals();
    }
});

if(closeWeightModalBtn) {
    closeWeightModalBtn.addEventListener('click', function() {
        addWeightModal.style.display = 'none';
        detailsModal.style.display = 'flex';
    });
}

// 🆕 NEW: Expense Modal Close Listeners
if(closeExpenseModalBtn) {
    closeExpenseModalBtn.addEventListener('click', function() {
        addExpenseModal.style.display = 'none';
        detailsModal.style.display = 'flex';
    });
}

// 🆕 NEW: Vaccination Modal Close Listeners
if(closeVaccinationModalBtn) {
    closeVaccinationModalBtn.addEventListener('click', function() {
        addVaccinationModal.style.display = 'none';
        detailsModal.style.display = 'flex';
    });
}

if (closeEditWeightModalBtn) {
    closeEditWeightModalBtn.addEventListener('click', function() {
        editWeightModal.style.display = 'none';
        detailsModal.style.display = 'flex';
    });
}

// 🆕 NEW: Clear Form Buttons
if (clearExpenseFormBtn) {
    clearExpenseFormBtn.addEventListener('click', function(e) {
        e.preventDefault(); // 🆕 ADD THIS LINE - Prevents form submission
        addExpenseForm.reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newExpenseDate').value = today;
    });
}

if (clearVaccinationFormBtn) {
    clearVaccinationFormBtn.addEventListener('click', function(e) {
        e.preventDefault(); // 🆕 ADD THIS LINE - Prevents form submission
        addVaccinationForm.reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newVaccinationDate').value = today;
        
        // Reset due date to 30 days from today
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('newVaccinationDueDate').value = dueDate.toISOString().split('T')[0];
    });
}

// 🆕 NEW: Expense and Vaccination Button Listeners
if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', openAddExpenseModal);
}

if (addVaccinationBtn) {
    addVaccinationBtn.addEventListener('click', openAddVaccinationModal);
}

// --- 🆕 Pig Details Action Menu & Edit Modal Listeners ---
if (pigDetailsMenuIcon) {
    pigDetailsMenuIcon.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevents click on icon from closing the menu immediately
        // IMPORTANT: Ensure pigActionMenu is NOT null before toggling class
        if (pigActionMenu) {
            pigActionMenu.classList.toggle('active');
        }
    });

    // Close menu when clicking anywhere else
    document.addEventListener('click', function() {
        if (pigActionMenu) {
            pigActionMenu.classList.remove('active');
        }
    });
}

// Wire up Menu Buttons
if (editPigDetailsBtn) {
    editPigDetailsBtn.addEventListener('click', function() {
        if (pigActionMenu) pigActionMenu.classList.remove('active');
        openEditPigDetailsModal(); // Open the new Edit Details Modal
    });
}

if (deletePigBtn) {
    deletePigBtn.addEventListener('click', function() {
        if (pigActionMenu) pigActionMenu.classList.remove('active');
        deletePig(currentDetailPigId); // Trigger the delete function
    });
}

// Edit Pig Details Cancel/Close Listeners (defined earlier)
if (closeEditPigDetailsModal) {
    closeEditPigDetailsModal.addEventListener('click', function() {
        editPigDetailsModal.style.display = 'none';
        detailsModal.style.display = 'flex'; // Go back to the details modal
    });
}

if (cancelEditPigDetails) {
    cancelEditPigDetails.addEventListener('click', function() {
        editPigDetailsModal.style.display = 'none';
        detailsModal.style.display = 'flex'; // Go back to the details modal
    });
}

// Edit Pig Details Form Submission (defined earlier)
if (editPigDetailsForm) {
    editPigDetailsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleEditPigDetailsSubmit(); 
    });
}
// --- END Pig Details Action Menu & Edit Modal Listeners ---


    // File Input change listeners
    if(newWeightImgInput) {
        newWeightImgInput.addEventListener('change', function() {
            if(this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.color = '#333';
                fileNameDisplay.style.fontStyle = 'normal';
            } else {
                fileNameDisplay.textContent = 'Upload Image';
                fileNameDisplay.style.color = 'var(--text-light)';
                fileNameDisplay.style.fontStyle = 'italic';
            }
        });
    }
    if (editWeightImgInput) {
        editWeightImgInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                editFileNameDisplay.textContent = this.files[0].name;
                editFileNameDisplay.style.color = '#333';
                editFileNameDisplay.style.fontStyle = 'normal';
            } else {
                editFileNameDisplay.textContent = 'Upload Image';
                editFileNameDisplay.style.color = 'var(--text-light)';
                editFileNameDisplay.style.fontStyle = 'italic';
            }
        });
    }

    // Main UI Buttons
    if (tabAdd) tabAdd.addEventListener('click', addNewFarm);
    if (addPigBtn) addPigBtn.addEventListener('click', openAddPigModal);
    if (notificationBtn) notificationBtn.addEventListener('click', openNotificationModal);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Details Modal Tab Switching
    const detailTabs = document.querySelectorAll('.detail-tab');
    detailTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            detailTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const tabId = this.getAttribute('data-tab');
            const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);
            if(pig) {
                updateDetailsTabContent(pig, tabId);
            }
        });
    });

    // --- Table Filtering & Selection (UNCHANGED) ---

    function setupSelectAllCheckbox(masterCheckbox, checkboxes) {
        if (!masterCheckbox) return;

        masterCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            checkboxes.forEach(checkbox => {
                if (!checkbox.disabled) {
                    checkbox.checked = isChecked;
                }
            });
        });

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
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

    function filterPigs(filterType) {
        const rows = document.querySelectorAll('.pig-row');
        let visibleCount = 0;

        rows.forEach(row => {
            if (filterType === 'all' || row.dataset.status === filterType) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        updateDisplayCounts(visibleCount);
    }

// =========================================================================
// ✅ Status Change Logic (UNCHANGED)
// =========================================================================

function changeSelectedPigsStatus(newStatus) {
    const selectedPigs = Array.from(pigCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => parseInt(checkbox.dataset.pigId));
    
    // --- 1. Initial Selection Check ---
    if (selectedPigs.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No Selection',
            text: 'Please select at least one pig to change the status.',
            showConfirmButton: false,
            timer: 2000
        });
        return;
    }

    // --- 2. Helper function to EXECUTE the status change (Non-Sale) ---
const executeStatusChange = (pigsToUpdate, status) => {
    const currentFarm = getCurrentFarm();
    let changedCount = 0;

    pigsToUpdate.forEach(pigId => {
        const pig = currentFarm.pigs.find(p => p.id === pigId);
        
        // Ensure we don't double-process the status
        if (pig && pig.status !== status && status !== 'sold') { 
            pig.status = status;
            pig.statusHistory.push({
                date: new Date().toISOString().split('T')[0],
                status: status,
                notes: `Status changed to ${formatStatusText(status)} via bulk action.`
            });
            changedCount++;
        }
    });

    if (changedCount > 0) {
        loadFarmData(currentFarmId);
        
        let successText = `${changedCount} pig(s) successfully changed to ${formatStatusText(status)}.`;
        let successTitle = (status === 'deceased') ? 'Pig Status Finalized!' : 'Status Updated!';

        Swal.fire({
            icon: 'success',
            title: successTitle,
            text: successText,
            showConfirmButton: false,
            timer: 2000
        });
    }
};

    // --- 3. SPECIAL HANDLING FOR 'SOLD' (BULK FLOW ENABLED) ---
    if (newStatus === 'sold') {
        if (selectedPigs.length >= 1) { // Allows one or more pigs
            openPriceInputModal(selectedPigs); // Pass the array of IDs
            // Clear checkboxes regardless of outcome
            pigCheckboxes.forEach(checkbox => checkbox.checked = false);
            selectAllCheckbox.checked = false;
            tableSelectAllCheckbox.checked = false;
            return;
        }
    }

    // --- 4. Confirmation Logic Setup (Non-Sale) ---
    let titleText = '';
    let isConfirmed = false;

    if (newStatus === 'growing' || newStatus === 'tosale') {
        titleText = `Are you sure you want to mark ${selectedPigs.length} pig(s) as "${formatStatusText(newStatus)}"?`;
        isConfirmed = true;
    } else if (newStatus === 'deceased') {
        titleText = `Mark ${selectedPigs.length} pig(s) as Deceased?`;
        isConfirmed = true;
    }
    
    // --- 5. Execute Confirmed/Default Status Changes (Non-Sale) ---
    if (isConfirmed) {
        Swal.fire({
            title: titleText,
            html: newStatus === 'deceased' ? titleText + '<br><small style="color:#888;">You won\'t be able to undo this later.</small>' : titleText,
            icon: newStatus === 'deceased' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Proceed',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                executeStatusChange(selectedPigs, newStatus);
            }
        });
    } 

    // Final Cleanup (only necessary if the function hasn't already returned)
    pigCheckboxes.forEach(checkbox => checkbox.checked = false);
    selectAllCheckbox.checked = false;
    tableSelectAllCheckbox.checked = false;
}//end of pig status


// =========================================================================
// 🐖 SALE PROCESS FUNCTIONS (FIXED)
// =========================================================================

// Step 1: Open the Price Input Modal (Corrected for Bulk)
function openPriceInputModal(pigIds) {
    currentPigsForSaleIds = pigIds;
    calculatedTotalSalePrice = 0;
    pricePerPigInput = 0;

    // Update modal header to reflect the bulk nature
    const modalHeader = priceInputModal.querySelector('.modal-header-sales h3');
    if (modalHeader) {
        modalHeader.textContent = `Enter Price Per Pig (for ${pigIds.length} Pig${pigIds.length > 1 ? 's' : ''})`;
    }

    priceInputModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (priceInput) priceInput.value = '';
}

// Step 2: Confirmation based on price per pig (SweetAlert)
function showPriceConfirmation(pricePerPig) {
    // Hide Step 1 modal before showing SweetAlert
    priceInputModal.style.display = 'none';

    const pigCount = currentPigsForSaleIds.length;
    const total = calculatedTotalSalePrice;

    Swal.fire({
        title: 'Please confirm:',
        html: `You're setting the price at ₱**${pricePerPig.toFixed(2)}** per pig, for **${pigCount}** pig(s).<br>
               Total calculated price: ₱**${total.toFixed(2)}**.<br><br>Do you want to proceed?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
         customClass: {
            popup: 'swal2-high-zindex' // Ensure SweetAlert is on top
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // If confirmed, proceed to the final modal (Step 3)
            showSoldConfirmationModal();
        } else {
            // If canceled, go back to Step 1 modal
            priceInputModal.style.display = 'flex';
        }
    });
}

// Step 3: Final Sold Confirmation Modal
function showSoldConfirmationModal() {
    // 1. Hide the Price Input Modal (Step 1)
    if (priceInputModal) {
        priceInputModal.style.display = 'none'; 
    }
    
    // 2. Format and display the TOTAL price in the input field
    if (finalSoldPriceDisplay) {
        finalSoldPriceDisplay.value = `₱${calculatedTotalSalePrice.toFixed(2)}`; 
    }
    
    // 3. Show the Sold Confirmation Modal (Step 3)
    if (soldConfirmationModal) {
        soldConfirmationModal.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
    }
}

// Step 4: Finalize Sale and Update Status (FIXED for Modal Closure)
function finalizeSale(totalPrice) {
    const pigCount = currentPigsForSaleIds.length;
    const saleDate = new Date().toISOString().split('T')[0];
    const avgPrice = pricePerPigInput;

    if (pigCount === 0) return;

    const currentFarm = getCurrentFarm();
    let changedCount = 0;

    currentPigsForSaleIds.forEach(pigId => {
        const pig = getPigById(pigId);
        if (pig) {
            pig.status = 'sold';
            // REQUIRED CHANGE: Show only 'Sold' in the table record's weight column
            pig.weight = `Sold`; 
            
            pig.statusHistory.push({
                date: saleDate,
                status: 'sold',
                notes: `Bulk sale of ${pigCount} pig(s). Total: ₱${totalPrice.toFixed(2)} (Avg. ₱${avgPrice.toFixed(2)} per pig).`
            });
            changedCount++;
        }
    });

    loadFarmData(currentFarmId); // Refresh table/data
    
    // ✅ FIX V2: Explicitly hide the final confirmation modal first.
    if (soldConfirmationModal) {
        soldConfirmationModal.style.display = 'none'; 
    }
    
    // Then call the generic function to clear state and restore body scrolling.
    closeAllModals(); 

    Swal.fire({
        icon: 'success',
        title: 'Bulk Sale Confirmed!',
        text: `${changedCount} pig(s) successfully marked as sold for a total of ₱${totalPrice.toFixed(2)}.`,
        showConfirmButton: false,
        timer: 3000
    });

    // Reset state is handled by closeAllModals
}


// =========================================================================
// 👂 SALE PROCESS LISTENERS (UNCHANGED)
// =========================================================================

// --- Price Input Modal Listener (Step 1 -> Step 2) ---
if (priceInputForm) {
    priceInputForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const pricePerPig = parseFloat(priceInput.value); 
        const pigCount = currentPigsForSaleIds.length;
        
        // Validation
        if (isNaN(pricePerPig) || pricePerPig <= 0 || pigCount === 0) {
            Swal.fire('Error', 'Please enter a valid price per pig and ensure at least one pig is selected.', 'error');
            return;
        }

        // 1. Calculation: Price per Pig * Pig Count
        calculatedTotalSalePrice = pricePerPig * pigCount;
        pricePerPigInput = pricePerPig; // Store P/Pig for confirmation/notes

        // 2. Proceed to Step 2: Show Price Confirmation (SweetAlert)
        showPriceConfirmation(pricePerPig); 
    });
}

// Utility listeners for Price Input Modal
document.getElementById('clearPriceInput')?.addEventListener('click', function() {
    priceInput.value = ''; 
});

// Closing the first modal
document.getElementById('closePriceInputModal')?.addEventListener('click', function(e) {
    e.stopPropagation();
    closeAllModals();
});


// --- Sold Confirmation Modal Listeners (Step 3 -> Step 4) ---

// Confirm Button: Triggers finalization (This is where the modal closes after confirmation)
if (confirmSoldPriceBtn) {
    confirmSoldPriceBtn.addEventListener('click', function() {
        if (currentPigsForSaleIds.length > 0 && calculatedTotalSalePrice > 0) {
            // Calls finalizeSale, which contains the closeAllModals() call
            finalizeSale(calculatedTotalSalePrice); 
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Sale calculation error. Please try again.' });
            closeAllModals();
        }
    });
}

// Cancel Button
document.getElementById('cancelSoldPrice')?.addEventListener('click', function(e) {
    e.stopPropagation(); 
    closeAllModals();
});

// Close Icon
document.getElementById('closeSoldConfirmationModal')?.addEventListener('click', function(e) {
    e.stopPropagation(); 
    closeAllModals();
});

// =========================================================================
// 🔄 END OF SALE PROCESS LISTENERS
// =========================================================================


    function updatePigCounts() {
        const currentFarm = getCurrentFarm();
        if (!currentFarm) return;

        const activePigs = currentFarm.pigs.filter(pig =>
            pig.status !== 'sold' && pig.status !== 'deceased'
        ).length;

        const totalPigs = currentFarm.pigs.length;

        if (activePigsCount) activePigsCount.textContent = activePigs;
        if (showingCount) showingCount.textContent = totalPigs;
        if (totalCount) totalCount.textContent = totalPigs;
    }

    function updateFilterCounts() {
        const currentFarm = getCurrentFarm();
        if (!currentFarm) return;

        const counts = {
            all: currentFarm.pigs.length,
            growing: currentFarm.pigs.filter(p => p.status === 'growing').length,
            tosale: currentFarm.pigs.filter(p => p.status === 'tosale').length,
            sold: currentFarm.pigs.filter(p => p.status === 'sold').length,
            deceased: currentFarm.pigs.filter(p => p.status === 'deceased').length
        };

        filterItems.forEach(item => {
            const filterType = item.dataset.filter;
            const countSpan = item.querySelector('.filter-count');
            if (countSpan) {
                countSpan.textContent = counts[filterType] || 0;
            }
        });
    }

    function updateDisplayCounts(visibleCount) {
        if (showingCount) showingCount.textContent = visibleCount;
    }

    // Attach event listeners for tabs, filters, dropdowns, and search
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const farmId = parseInt(this.dataset.farm);
            switchToFarm(farmId);
        });
    });

    filterItems.forEach(item => {
        item.addEventListener('click', function() {
            filterItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const filterType = this.dataset.filter;
            filterPigs(filterType);
        });
    });

    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', function() {
            dropdown.classList.remove('active');
        });

        dropdownItems?.forEach(item => {
            item.addEventListener('click', function() {
                const status = this.dataset.status;
                changeSelectedPigsStatus(status);
                dropdown.classList.remove('active');
            });
        });
    }

    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = this.value.toLowerCase().trim();
                searchPigs(searchTerm);
            }, 300);
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                searchPigs('');
            }
        });
    }

    function searchPigs(searchTerm) {
        const rows = document.querySelectorAll('.pig-row');
        let visibleCount = 0;

        rows.forEach(row => {
            const pigName = row.querySelector('.col-name')?.textContent.toLowerCase() || '';
            const pigId = row.querySelector('.pig-id-badge')?.textContent.toLowerCase() || '';
            const pigStatus = row.dataset.status;

            const matchesSearch = !searchTerm ||
                                 pigName.includes(searchTerm) ||
                                 pigId.includes(searchTerm) ||
                                 pigStatus.includes(searchTerm);

            if (matchesSearch) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        updateDisplayCounts(visibleCount);
    }


// 🆕 FIXED: Farm Context Menu Function
function showFarmContextMenu(farmId, event) {
    event.preventDefault();
    event.stopPropagation();
    
    currentContextFarmId = farmId;
    console.log('Context menu opened for farm:', farmId, 'currentContextFarmId:', currentContextFarmId);
    
    const farmTab = event.target;
    const tabRect = farmTab.getBoundingClientRect();
    const menuWidth = 180;
    
    let leftPosition = tabRect.left + (tabRect.width - menuWidth) / 2;
    const padding = 10;
    
    if (leftPosition + menuWidth > window.innerWidth - padding) {
        leftPosition = window.innerWidth - menuWidth - padding;
    }
    
    if (leftPosition < padding) {
        leftPosition = padding;
    }
    
    farmContextMenu.style.left = leftPosition + 'px';
    farmContextMenu.style.top = (tabRect.bottom + window.scrollY) + 'px';
    farmContextMenu.classList.add('active');
    
    // 🆕 FIX: Use a named function for proper removal
    function closeContextMenuHandler(e) {
        if (!farmContextMenu.contains(e.target) && !e.target.classList.contains('tab')) {
            // 🆕 DON'T reset currentContextFarmId here - keep it until an action is taken
            farmContextMenu.classList.remove('active');
            document.removeEventListener('click', closeContextMenuHandler);
        }
    }
    
    document.addEventListener('click', closeContextMenuHandler);
}

// 🆕 FIXED: Hide context menu (don't reset currentContextFarmId here)
function hideFarmContextMenu() {
    farmContextMenu.classList.remove('active');
    // 🆕 DON'T set currentContextFarmId = null here
}

function renameFarm(farmId, newName) {
    const farm = farms.find(f => f.id === farmId);
    if (!farm) return;
    
    const trimmedName = newName.trim();
    if (!trimmedName) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Name',
            text: 'Farm name cannot be empty.',
            showConfirmButton: true,
            confirmButtonColor: '#dc2626'
        });
        return;
    }
    
    const isDuplicate = farms.some(f => 
        f.id !== farmId && f.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
        Swal.fire({
            icon: 'error',
            title: 'Duplicate Name',
            text: 'A farm with this name already exists.',
            showConfirmButton: true
        });
        return;
    }
    
    farm.name = trimmedName;
    
    const farmTab = document.querySelector(`.tab[data-farm="${farmId}"]`);
    if (farmTab) {
        farmTab.textContent = trimmedName;
    }
    
    renameFarmModal.style.display = 'none';
    
    // 🆕 RESET the currentContextFarmId only after successful rename
    currentContextFarmId = null;
    
    Swal.fire({
        icon: 'success',
        title: 'Farm Renamed!',
        text: `Farm has been renamed to "${trimmedName}".`,
        showConfirmButton: false,
        timer: 2000
    });
}

// 🆕 NEW: Delete Farm Function
function deleteFarm(farmId) {
    if (farms.length <= 1) {
        Swal.fire({
            icon: 'warning',
            title: 'Cannot Delete',
            text: 'You must have at least one farm.',
            showConfirmButton: true
        });
        return;
    }
    
    const farm = farms.find(f => f.id === farmId);
    if (!farm) return;
    
    Swal.fire({
        title: 'Delete Farm?',
        html: `You are about to delete <strong>"${farm.name}"</strong> and all its pigs.<br><br>This action cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#4CAF50',
        confirmButtonText: 'Yes, Delete It',
        cancelButtonText: 'Cancel',
        customClass: {
            popup: 'swal2-high-zindex'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Remove farm from array
            farms = farms.filter(f => f.id !== farmId);
            
            // Remove farm tab
            const farmTab = document.querySelector(`.tab[data-farm="${farmId}"]`);
            if (farmTab) {
                farmTab.remove();
            }
            
            // Switch to first available farm
            if (farms.length > 0) {
                switchToFarm(farms[0].id);
            }
            
            hideFarmContextMenu();
            
            Swal.fire({
                icon: 'success',
                title: 'Farm Deleted!',
                text: `"${farm.name}" and all its pigs have been removed.`,
                showConfirmButton: false,
                timer: 2000
            });
        }
    });
}



// 🆕 FIXED: Open Rename Farm Modal
function openRenameFarmModal() {
    console.log('Opening rename modal, currentContextFarmId:', currentContextFarmId);
    
    if (!currentContextFarmId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No farm selected. Please try again.',
            showConfirmButton: true
        });
        return;
    }
    
    const farm = farms.find(f => f.id === currentContextFarmId);
    if (!farm) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Farm not found.',
            showConfirmButton: true
        });
        return;
    }
    
    newFarmNameInput.value = farm.name;
    newFarmNameInput.focus();
    
    renameFarmModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

    function init() {
        // Load initial farm data
        loadFarmData(currentFarmId);
        
        // 🆕 ADD DOUBLE-CLICK TO EXISTING FARM TABS
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('dblclick', function(e) {
                const farmId = parseInt(this.dataset.farm);
                showFarmContextMenu(farmId, e);
            });
        });
    }

    // Start the application
    init();
});
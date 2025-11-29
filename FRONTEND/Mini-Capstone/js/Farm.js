// ======================================================================
// POINKY FARM.JS
// - Handles farms, pigs, modals, weight, expenses, vaccination, and sale
// ======================================================================

document.addEventListener('DOMContentLoaded', function() {

    // ------------------------------------------------------------
    // 1. DOM ELEMENT REFERENCES & GLOBAL STATE
    // ------------------------------------------------------------

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

    // --- Modal elements: main pig & notification modals ---
    const addPigModal = document.getElementById('addPigModal');
    const notificationModal = document.getElementById('notificationModal');
    const addPigForm = document.getElementById('addPigForm');
    const detailsModal = document.getElementById('pigDetailsModal');

    // --- Weight modals ---
    const addWeightModal = document.getElementById('addWeightModal');
    const addWeightForm = document.getElementById('addWeightForm');
    const newWeightImgInput = document.getElementById('newWeightImg');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const btnOpenAddWeight = document.querySelector('.btn-add-record');
    const closeWeightModalBtn = document.getElementById('closeWeightModal');

    // Expense and Vaccination Modal Elements
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

    // --- Sale Modal Elements ---
    const priceInputModal = document.getElementById('priceInputModal');
    const soldConfirmationModal = document.getElementById('soldConfirmationModal');
    const priceInputForm = document.getElementById('priceInputForm');
    const priceInput = document.getElementById('priceInput'); // User enters price (interpreted as price per kg)
    const finalSoldPriceDisplay = document.getElementById('finalSoldPriceDisplay');
    const confirmSoldPriceBtn = document.getElementById('confirmSoldPrice');

    // Global State Variables (for BULK SALE)
    let currentPigsForSaleIds = [];   // IDs of pigs involved in current bulk sale
    let calculatedTotalSalePrice = 0; // PricePerPig * count
    let pricePerPigInput = 0;         // Value user entered (per kg)
    let currentPigForSaleId = null;   // Reserved for single-sale use (not used in bulk)

    // --- Edit Weight Modal elements ---
    const editWeightModal = document.getElementById('editWeightModal');
    const editWeightForm = document.getElementById('editWeightForm');
    const editWeightImgInput = document.getElementById('editWeightImg');
    const editFileNameDisplay = document.getElementById('editFileNameDisplay');
    const closeEditWeightModalBtn = document.getElementById('closeEditWeightModal');
    const btnCancelEditWeight = document.getElementById('btnCancelEditWeight');

    // --- Detail view state ---
    let currentDetailPigId = null;
    let currentEditWeightRecordIndex = null;

    // Farm Context Menu Elements
    const farmContextMenu = document.getElementById('farmContextMenu');
    const renameFarmBtn = document.getElementById('renameFarmBtn');
    const deleteFarmBtn = document.getElementById('deleteFarmBtn');
    const renameFarmModal = document.getElementById('renameFarmModal');
    const renameFarmForm = document.getElementById('renameFarmForm');
    const newFarmNameInput = document.getElementById('newFarmName');
    const closeRenameFarmModal = document.getElementById('closeRenameFarmModal');
    const cancelRenameFarm = document.getElementById('cancelRenameFarm');

    let currentContextFarmId = null; // Track which farm is being edited via context menu

    // Pig Details Action Menu Elements
    const pigDetailsMenuIcon = document.getElementById('pigDetailsMenuIcon');
    const pigActionMenu = document.getElementById('pigActionMenu');
    const editPigDetailsBtn = document.getElementById('editPigDetailsBtn');
    const deletePigBtn = document.getElementById('deletePigBtn');
    
    // Edit Pig Details Modal Elements
    const editPigDetailsModal = document.getElementById('editPigDetailsModal');
    const closeEditPigDetailsModal = document.getElementById('closeEditPigDetailsModal');
    const cancelEditPigDetails = document.getElementById('cancelEditPigDetails');
    const editPigDetailsForm = document.getElementById('editPigDetailsForm');
    const editPigNameInput = document.getElementById('editPigName');
    const editPigBreedInput = document.getElementById('editPigBreed');
    const editPigGenderInput = document.getElementById('editPigGender');
    const editPigDateInput = document.getElementById('editPigDate');
    const editPigShortIdDisplay = document.getElementById('editPigShortIdDisplay');

    // ------------------------------------------------------------
    // 2. FARM DATA STRUCTURE (IN-MEMORY DB)
    // ------------------------------------------------------------

    let farms = [
        { id: 1, name: 'Farm 1', pigs: [] },
        { id: 2, name: 'Farm 2', pigs: [] },
        { id: 3, name: 'Farm 3', pigs: [] }
    ];

    let currentFarmId = 1;
    let nextFarmId = 4;
    let nextPigId = 1;

    const getCurrentFarm = () => farms.find(farm => farm.id === currentFarmId);
    const getPigById = (pigId) => getCurrentFarm()?.pigs.find(p => p.id === pigId);

    // ------------------------------------------------------------
    // 3. HELPER FUNCTIONS (STATUS, WEIGHT, DUPLICATES)
    // ------------------------------------------------------------

    function formatStatusText(status) {
        const statusMap = {
            'growing': 'Growing',
            'tosale': 'To Sale',
            'sold': 'Sold',
            'deceased': 'Deceased'
        };
        return statusMap[status] || status;
    }

    function getNewestWeight(history) {
        if (!history || history.length === 0) {
            return 0;
        }
        
        const newestRecord = history.reduce((latest, record) => {
            const latestDate = new Date(latest.date || 0);
            const recordDate = new Date(record.date);
            
            if (recordDate > latestDate) {
                return record;
            } else if (recordDate.getTime() === latestDate.getTime() && record.weight > latest.weight) {
                return record;
            }
            return latest;
        }, { date: '1970-01-01', weight: 0 });

        return newestRecord.weight;
    }

    function isDuplicatePigName(pigName) {
        const currentFarm = getCurrentFarm();
        if (!currentFarm) return false;

        return currentFarm.pigs.some(pig => pig.name.toLowerCase() === pigName.toLowerCase());
    }

    function getNewestWeightRecord(history) {
        if (!history || history.length === 0) {
            return null;
        }
        
        return history.reduce((latest, record) => {
            const latestDate = new Date(latest.date || 0);
            const recordDate = new Date(record.date);
            
            if (recordDate > latestDate) {
                return record;
            } else if (recordDate.getTime() === latestDate.getTime() && record.weight > latest.weight) {
                return record;
            }
            return latest;
        }, { date: '1970-01-01', weight: 0 });
    }

    // ------------------------------------------------------------
    // 4. GLOBAL MODAL HANDLING HELPERS
    // ------------------------------------------------------------

    function closeAllModals() {
        const modals = document.querySelectorAll('.modal, .notification-modal, .modal-stat');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';

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

    // ------------------------------------------------------------
    // 5. FARM MANAGEMENT (ADD, SWITCH, CONTEXT MENU, RENAME, DELETE)
    // ------------------------------------------------------------

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

    document.addEventListener('click', function(e) {
        if (!farmContextMenu.contains(e.target)) {
            hideFarmContextMenu();
        }
    });

    if (renameFarmBtn) {
        renameFarmBtn.addEventListener('click', function(e) {
            e.stopPropagation();
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

    if (renameFarmForm) {
        renameFarmForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
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
            
            renameFarm(currentContextFarmId, newName);
        });
    }

    if (closeRenameFarmModal) {
        closeRenameFarmModal.addEventListener('click', function() {
            renameFarmModal.style.display = 'none';
            currentContextFarmId = null;
            document.body.style.overflow = 'auto';
        });
    }

    if (cancelRenameFarm) {
        cancelRenameFarm.addEventListener('click', function() {
            renameFarmModal.style.display = 'none';
            currentContextFarmId = null;
            document.body.style.overflow = 'auto';
        });
    }

    if (renameFarmModal) {
        renameFarmModal.addEventListener('click', function(e) {
            if (e.target === renameFarmModal) {
                renameFarmModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                currentContextFarmId = null;
            }
        });
    }

    function switchToFarm(farmId) {
        tabs.forEach(tab => tab.classList.remove('active'));
        const currentTab = document.querySelector(`.tab[data-farm="${farmId}"]`);
        if (currentTab) {
            currentTab.classList.add('active');
        }

        currentFarmId = farmId;
        loadFarmData(farmId);
    }

    // ------------------------------------------------------------
    // 6. PIG MANAGEMENT (ADD PIG, RENDER ROWS, LOAD FARM)
    // ------------------------------------------------------------

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
                img: 'assets/dash-icons/WPig.png'
            }],
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

    function loadFarmData() {
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

    // ------------------------------------------------------------
    // 7. PIG DETAILS MODAL & TABS
    // ------------------------------------------------------------

    window.openPigDetails = function(pigId) {
        const pig = getCurrentFarm()?.pigs.find(p => p.id === pigId);

        if (!pig) return;
        currentDetailPigId = pigId;

        document.getElementById('detailName').textContent = pig.name;
        document.getElementById('detailBreed').textContent = pig.breed;
        document.getElementById('detailGender').textContent = pig.gender.charAt(0).toUpperCase() + pig.gender.slice(1);
        document.getElementById('detailDate').textContent = pig.date;
        document.getElementById('detailInitialWeight').textContent = (pig.weightHistory[0]?.weight || '0') + ' kg';
        
        const currentWeight = getNewestWeight(pig.weightHistory);
        document.getElementById('detailCurrentWeight').textContent = `${currentWeight} kg`;
        
        document.getElementById('detailStatus').textContent = formatStatusText(pig.status);

        document.querySelectorAll('.detail-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`.detail-tab[data-tab="weight"]`)?.classList.add('active');

        updateDetailsTabContent(pig, 'weight');

        detailsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // if pig is sold/deceased, remove/hide edit button and disable add actions
        const locked = pig.status === 'sold' || pig.status === 'deceased';
        const editBtn = document.getElementById('editPigDetailsBtn');
        if (editBtn) editBtn.style.display = locked ? 'none' : '';

        // Hide/disable the generic 'Add' button if the pig is sold/deceased
        const btnOpenAddWeight = document.querySelector('.btn-add-record');
        if (btnOpenAddWeight) btnOpenAddWeight.style.display = locked ? 'none' : btnOpenAddWeight.style.display;
    };

    function updateDetailsTabContent(pig, tabId) {
        document.querySelectorAll('.details-main .tab-content').forEach(c => c.style.display = 'none');

        const content = document.getElementById(`tab-${tabId}`);
        if (!content) return;

        content.style.display = 'block';

        // WEIGHT TAB
        if (tabId === 'weight') {
            const tbody = document.getElementById('weightRecordsBody');
            tbody.innerHTML = '';

            if (pig.weightHistory && pig.weightHistory.length > 0) {
                const sortedHistory = pig.weightHistory.slice().sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    if (dateB.getTime() !== dateA.getTime()) {
                        return dateB - dateA;
                    }
                    return b.weight - a.weight;
                });
                
                sortedHistory.forEach((rec) => {
                    const tr = document.createElement('tr');
                    const originalIndex = pig.weightHistory.findIndex(r => r.date === rec.date && r.weight === rec.weight);
                    
                    const dateObj = new Date(rec.date);
                    const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    
                    let actionIconHTML = '';

                        const locked = pig.status === 'sold' || pig.status === 'deceased';
                        if (rec === sortedHistory[0]) {
                            // only show edit icon when not locked
                            actionIconHTML = locked ? '' : `<i class="fas fa-edit action-icon edit-icon" data-record-index="${originalIndex}"></i>`;
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

                tbody.querySelectorAll('.edit-icon').forEach(icon => {
                    icon.addEventListener('click', function() {
                        const index = parseInt(this.dataset.recordIndex); 
                        openEditWeightModal(index);
                    });
                });
                tbody.querySelectorAll('.delete-icon').forEach(icon => {
                    icon.addEventListener('click', function() {
                        const index = parseInt(this.dataset.recordIndex); 
                        deleteWeightRecord(index);
                    });
                });

            } else {
                tbody.innerHTML = '<tr><td colspan="3">No weight records found.</td></tr>';
            }
        }

        // EXPENSES TAB
        else if (tabId === 'expenses') {
            const tbody = document.getElementById('expensesRecordsBody');
            tbody.innerHTML = '';

            if (pig.expenseRecords && pig.expenseRecords.length > 0) {
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

                const sortedExpenses = validExpenses.slice().sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                });

                sortedExpenses.forEach((expense) => {
                    const tr = document.createElement('tr');
                    
                    let dateString = 'Invalid Date';
                    try {
                        const dateObj = new Date(expense.date);
                        if (!isNaN(dateObj.getTime())) {
                            dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }
                    } catch (e) {
                        console.warn('Invalid date:', expense.date);
                    }
                    
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

                if (validExpenses.length < pig.expenseRecords.length) {
                    pig.expenseRecords = validExpenses;
                }
                
            } else {
                tbody.innerHTML = '<tr><td colspan="3">No expense records found.</td></tr>';
            }
        }

        // HEALTH / VACCINATION TAB
        else if (tabId === 'health') {
            const tbody = document.getElementById('vaccinationRecordsBody');
            tbody.innerHTML = '';

            if (pig.vaccinationRecords && pig.vaccinationRecords.length > 0) {
                const validVaccinations = pig.vaccinationRecords.filter(vaccination => 
                    vaccination.date && 
                    vaccination.dueDate && 
                    vaccination.type
                );

                if (validVaccinations.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4">No valid vaccination records found.</td></tr>';
                    return;
                }

                const sortedVaccinations = validVaccinations.slice().sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                });

                sortedVaccinations.forEach((vaccination) => {
                    const tr = document.createElement('tr');
                    
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

                if (validVaccinations.length < pig.vaccinationRecords.length) {
                    pig.vaccinationRecords = validVaccinations;
                }
                
            } else {
                tbody.innerHTML = '<tr><td colspan="4">No vaccination records found.</td></tr>';
            }
        }

        // Update header "Add" button behavior
        if (tabId === 'weight') {
            if (btnOpenAddWeight) {
                const locked = pig.status === 'sold' || pig.status === 'deceased';
                btnOpenAddWeight.textContent = 'Add Weight';
                btnOpenAddWeight.onclick = () => {
                    if (locked) {
                        Swal.fire('Not allowed', 'Cannot add weight to a sold or deceased pig.', 'warning');
                        return;
                    }
                    openAddWeightModal();
                };
                btnOpenAddWeight.style.display = locked ? 'none' : 'inline-block';
            }
        } else if (tabId === 'expenses') {
            if (btnOpenAddWeight) {
                const locked = pig.status === 'sold' || pig.status === 'deceased';
                btnOpenAddWeight.textContent = 'Add Expenses';
                btnOpenAddWeight.onclick = () => {
                    if (locked) {
                        Swal.fire('Not allowed', 'Cannot add expense to a sold or deceased pig.', 'warning');
                        return;
                    }
                    openAddExpenseModal();
                };
                btnOpenAddWeight.style.display = locked ? 'none' : 'inline-block';
            }
        } else if (tabId === 'health') {
            if (btnOpenAddWeight) {
                const locked = pig.status === 'sold' || pig.status === 'deceased';
                btnOpenAddWeight.textContent = 'Add Vaccination';
                btnOpenAddWeight.onclick = () => {
                    if (locked) {
                        Swal.fire('Not allowed', 'Cannot add vaccination to a sold or deceased pig.', 'warning');
                        return;
                    }
                    openAddVaccinationModal();
                };
                btnOpenAddWeight.style.display = locked ? 'none' : 'inline-block';
            }
        } else if (btnOpenAddWeight) {
            btnOpenAddWeight.style.display = 'none';
        }
    }

    // ------------------------------------------------------------
    // 8. DATA CLEANUP HELPERS
    // ------------------------------------------------------------

    function cleanupInvalidRecords() {
        const currentFarm = getCurrentFarm();
        if (currentFarm) {
            currentFarm.pigs.forEach(pig => {
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

    cleanupInvalidRecords();

    // ------------------------------------------------------------
    // 9. EXPENSE & VACCINATION MODALS (OPEN FUNCTIONS)
    // ------------------------------------------------------------

    function openAddExpenseModal() {
        if (!currentDetailPigId) return;
        // pig already retrieved and validated above
        if (pig.status === 'sold' || pig.status === 'deceased') {
            Swal.fire('Not allowed', 'Cannot add expense to a sold or deceased pig.', 'warning');
            return;
        }
        detailsModal.style.display = 'none';
        addExpenseModal.style.display = 'flex';

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newExpenseDate').value = today;
    }

    function openAddVaccinationModal() {
        if (!currentDetailPigId) return;
        // pig already retrieved above
        if (pig.status === 'sold' || pig.status === 'deceased') {
            Swal.fire('Not allowed', 'Cannot add vaccination to a sold or deceased pig.', 'warning');
            return;
        }
        detailsModal.style.display = 'none';
        addVaccinationModal.style.display = 'flex';

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newVaccinationDate').value = today;
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('newVaccinationDueDate').value = dueDate.toISOString().split('T')[0];
    }

    // ------------------------------------------------------------
    // 10. PIG DETAILS EDIT (OPEN, SAVE, DELETE PIG)
    // ------------------------------------------------------------

    function openEditPigDetailsModal() {
        if (!currentDetailPigId) return;
        const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);
        if (!pig) return;

        if (pig.status === 'sold' || pig.status === 'deceased') {
            Swal.fire('Not allowed', 'This pig is sold or deceased — details cannot be edited.', 'warning');
            return;
        }

        // pig already retrieved and validated above

        editPigNameInput.value = pig.name;
        editPigGenderInput.value = pig.gender;
        editPigDateInput.value = pig.date;
        editPigShortIdDisplay.textContent = `Editing: ${pig.shortId} (${pig.name})`;

        const breedSelect = document.getElementById('editPigBreed');
        if (breedSelect) {
            if (!breedSelect.querySelector(`option[value="${pig.breed}"]`)) {
                breedSelect.value = 'Other';
            } else {
                breedSelect.value = pig.breed;
            }
        }

        detailsModal.style.display = 'none';
        editPigDetailsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function handleEditPigDetailsSubmit() {
        if (!currentDetailPigId) return;
        const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);
        if (!pig) return;

        const newName = editPigNameInput.value.trim();
        const newBreed = document.getElementById('editPigBreed').value;

        const isDup = getCurrentFarm().pigs.some(p => 
            p.id !== currentDetailPigId && p.name.toLowerCase() === newName.toLowerCase()
        );

        if (isDup) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Name',
                text: 'A pig with this name already exists in this farm.',
                showConfirmButton: true
            });
            return;
        }

        pig.name = newName;
        pig.breed = newBreed;
        pig.gender = editPigGenderInput.value;
        pig.date = editPigDateInput.value;
        pig.shortId = pig.name.substring(0, 3).toUpperCase();
        
        editPigDetailsModal.style.display = 'none';
        loadFarmData(currentFarmId);
        
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

        openCustomConfirm('Delete Pig?', `You are about to permanently remove this pig record. This cannot be undone!`, function() {
            const currentFarm = getCurrentFarm();
            if (currentFarm) {
                const pigIndex = currentFarm.pigs.findIndex(p => p.id === pigId);
                if (pigIndex > -1) {
                    currentFarm.pigs.splice(pigIndex, 1);
                    closeAllModals();
                    loadFarmData(currentFarmId);
                    openSuccessModal('The pig record has been successfully removed.');
                }
            }
        }, function() {
            // cancelled - do nothing
        }, 'Yes, Delete It', 'No');
    }

    // ------------------------------------------------------------
    // 11. WEIGHT MODALS (OPEN / EDIT / DELETE)
    // ------------------------------------------------------------

    function openAddWeightModal() {
        if (!currentDetailPigId) return;
        const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);
        if (!pig) return;
        if (pig.status === 'sold' || pig.status === 'deceased') {
            Swal.fire('Not allowed', 'Cannot add weight to a sold or deceased pig.', 'warning');
            return;
        }
        detailsModal.style.display = 'none';
        addWeightModal.style.display = 'flex';

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newWeightDate').value = today;

        fileNameDisplay.textContent = 'Upload Image';
        fileNameDisplay.style.color = 'var(--text-light)';
        fileNameDisplay.style.fontStyle = 'italic';
        document.getElementById('newWeightImg').value = '';
    }

    function openEditWeightModal(recordIndex) {
        if (!currentDetailPigId) return;
        const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);
        if (!pig) return;
        if (pig.status === 'sold' || pig.status === 'deceased') {
            Swal.fire('Not allowed', 'Cannot edit weight for a sold or deceased pig.', 'warning');
            return;
        }

        if (!pig || !pig.weightHistory || recordIndex >= pig.weightHistory.length) return;

        currentEditWeightRecordIndex = recordIndex;
        const recordToEdit = pig.weightHistory[recordIndex];

        document.getElementById('editWeightDate').value = recordToEdit.date;
        document.getElementById('editWeightValue').value = recordToEdit.weight;

        const isDefaultImage =
            recordToEdit.img.includes('assets/dash-icons/WPig.png') ||
            recordToEdit.img.includes('Dash Icons/WPig.png');

        editFileNameDisplay.textContent = isDefaultImage ? 'Upload Image' : 'Current Image';
        editFileNameDisplay.style.color = isDefaultImage ? 'var(--text-light)' : '#333';
        editFileNameDisplay.style.fontStyle = isDefaultImage ? 'italic' : 'normal';
        editWeightImgInput.value = '';

        detailsModal.style.display = 'none';
        editWeightModal.style.display = 'flex';
    }

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
            customClass: {
                popup: 'swal2-high-zindex'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                pig.weightHistory.splice(recordIndex, 1);

                const newCurrentWeight = getNewestWeight(pig.weightHistory);
                pig.weight = `${newCurrentWeight}kg`;

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

    // ------------------------------------------------------------
    // 12. ADD PIG FORM HANDLER + MODAL CONTROL
    // ------------------------------------------------------------

    const closeAddPigModalBtn = document.getElementById('closeAddPigModal');
    const clearAddPigFormBtn  = document.getElementById('clearAddPigForm');
    const successModal        = document.getElementById('successModal');
    const successModalMessage = document.getElementById('successModalMessage');
    // custom confirm modal elements (replaces SweetAlert confirmations)
    const customConfirmModal = document.getElementById('customConfirmModal');
    const customConfirmTitle = document.getElementById('customConfirmTitle');
    const customConfirmMessage = document.getElementById('customConfirmMessage');
    const customConfirmCancel = document.getElementById('customConfirmCancel');
    const customConfirmConfirm = document.getElementById('customConfirmConfirm');
    const closeCustomConfirm = document.getElementById('closeCustomConfirm');

    function openAddPigModal() {
        if (addPigModal) {
            addPigModal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            const pigDateInput = document.getElementById('pigDate');
            if (pigDateInput) {
                const today = new Date().toISOString().split('T')[0];
                pigDateInput.value = today;

                const wrapper = pigDateInput.closest('.date-wrapper');
                if (wrapper) {
                    wrapper.classList.add('has-value');
                    wrapper.classList.remove('is-focused');
                }
            }

            const pigNameInput = document.getElementById('pigName');
            if (pigNameInput) pigNameInput.focus();
        }
    }

    function closeAddPigModalFn() {
        if (!addPigModal) return;
        addPigModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function openSuccessModal(message) {
        if (!successModal) return;
        if (successModalMessage && message) successModalMessage.textContent = message;
        successModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeSuccessModal() {
        if (!successModal) return;
        successModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Reusable custom confirmation dialog helper
    let __customConfirm_onConfirm = null;
    let __customConfirm_onCancel = null;

    function openCustomConfirm(title, message, onConfirm, onCancel, confirmText = 'Yes', cancelText = 'No') {
        if (!customConfirmModal) return;
        if (customConfirmTitle) customConfirmTitle.textContent = title || 'Confirm';
        if (customConfirmMessage) customConfirmMessage.innerHTML = message || '';

        // set button labels
        if (customConfirmConfirm) customConfirmConfirm.textContent = confirmText || 'Yes';
        if (customConfirmCancel) customConfirmCancel.textContent = cancelText || 'No';

        // assign handlers
        __customConfirm_onConfirm = onConfirm;
        __customConfirm_onCancel = onCancel;

        customConfirmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeCustomConfirmModal() {
        if (!customConfirmModal) return;
        customConfirmModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        __customConfirm_onConfirm = null;
        __customConfirm_onCancel = null;
    }

    // wire confirm/cancel buttons
    if (customConfirmCancel) customConfirmCancel.addEventListener('click', function() {
        if (__customConfirm_onCancel) __customConfirm_onCancel();
        closeCustomConfirmModal();
    });
    if (customConfirmConfirm) customConfirmConfirm.addEventListener('click', function() {
        if (__customConfirm_onConfirm) __customConfirm_onConfirm();
        closeCustomConfirmModal();
    });
    if (closeCustomConfirm) closeCustomConfirm.addEventListener('click', closeCustomConfirmModal);

    function resetAddPigFormFloatingStates() {
        if (!addPigForm) return;

        addPigForm.querySelectorAll('.input-wrapper input').forEach(inp => {
            inp.classList.remove('has-value');
            const wrapper = inp.closest('.input-wrapper');
            if (wrapper) wrapper.classList.remove('is-focused');
        });

        addPigForm.querySelectorAll('.input-wrapper select').forEach(sel => {
            sel.classList.remove('has-value');
            const wrapper = sel.closest('.input-wrapper');
            if (wrapper) wrapper.classList.remove('is-focused');
        });

        addPigForm.querySelectorAll('.date-wrapper').forEach(wrapper => {
            wrapper.classList.remove('has-value', 'is-focused');
        });

        const weightWrapper = addPigForm.querySelector('.weight-wrapper');
        if (weightWrapper) {
            weightWrapper.classList.remove('is-focused');
        }
    }

    // 🔹 NEW: Floating label listeners for inputs/selects/date
    function applyFloatingLabelListeners() {
        const fields = document.querySelectorAll('.input-wrapper input, .input-wrapper select, .date-wrapper input');

        fields.forEach(field => {
            // Focus → highlight wrapper
            field.addEventListener('focus', function () {
                const wrapper = this.closest('.input-wrapper, .date-wrapper');
                if (wrapper) wrapper.classList.add('is-focused');
            });

            // Blur → keep label up only if has value
            field.addEventListener('blur', function () {
                const wrapper = this.closest('.input-wrapper, .date-wrapper');
                if (!wrapper) return;

                wrapper.classList.remove('is-focused');

                if (this.value && this.value.toString().trim() !== '') {
                    wrapper.classList.add('has-value');
                } else {
                    wrapper.classList.remove('has-value');
                }
            });

            // On load: if already has value (e.g., default date), float label
            if (field.value && field.value.toString().trim() !== '') {
                const wrapper = field.closest('.input-wrapper, .date-wrapper');
                if (wrapper) {
                    wrapper.classList.add('has-value');
                }
            }
        });
    }

    if (closeAddPigModalBtn) {
        closeAddPigModalBtn.addEventListener('click', () => {
            closeAddPigModalFn();
        });
    }

    if (addPigModal) {
        addPigModal.addEventListener('click', (e) => {
            if (e.target === addPigModal) {
                closeAddPigModalFn();
            }
        });
    }

    if (clearAddPigFormBtn) {
        clearAddPigFormBtn.addEventListener('click', () => {
            if (!addPigForm) return;

            addPigForm.reset();
            resetAddPigFormFloatingStates();

            const pigDateInput = document.getElementById('pigDate');
            if (pigDateInput) {
                pigDateInput.value = '';
                const wrapper = pigDateInput.closest('.date-wrapper');
                if (wrapper) wrapper.classList.remove('has-value', 'is-focused');
            }
        });
    }

    if (addPigForm) {
        addPigForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const pigNameInput = document.getElementById('pigName');
            const pigName      = pigNameInput ? pigNameInput.value.trim() : '';

            const pigData = {
                name:   pigName,
                breed:  document.getElementById('pigBreed')?.value || '',
                gender: document.getElementById('pigGender')?.value || '',
                age:    document.getElementById('pigAge')?.value || '',
                date:   document.getElementById('pigDate')?.value || '',
                initialWeight: document.getElementById('pigWeight')?.value || ''
            };

            const allFilled = Object.values(pigData).every(val => val !== '' && val !== null);
            if (!allFilled) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Missing Information',
                    text: 'Please fill out all fields before saving.',
                    showConfirmButton: true,
                    confirmButtonColor: '#dc2626'
                });
                return;
            }

            if (isDuplicatePigName(pigName)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Entry',
                    text: 'A pig with the name "' + pigName + '" already exists in this farm. Pig names must be unique.',
                    showConfirmButton: true
                });
                return;
            }

            addNewPig(pigData);

            closeAddPigModalFn();
            openSuccessModal();

            this.reset();
            resetAddPigFormFloatingStates();

            const pigDateInput = document.getElementById('pigDate');
            if (pigDateInput) {
                const today = new Date().toISOString().split('T')[0];
                pigDateInput.value = today;

                const pigDateWrapper = pigDateInput.closest('.date-wrapper');
                if (pigDateWrapper) {
                    pigDateWrapper.classList.add('has-value');
                    pigDateWrapper.classList.remove('is-focused');
                }
            }

            setTimeout(() => {
                closeSuccessModal();
            }, 2000);
        });
    }

    // ------------------------------------------------------------
    // 13. ADD / EDIT WEIGHT FORM HANDLERS
    // ------------------------------------------------------------

    if (addWeightForm) {
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
                    img: newWeightImgInput.files && newWeightImgInput.files[0]
                        ? URL.createObjectURL(newWeightImgInput.files[0])
                        : 'assets/dash-icons/WPig.png'
                };

                pig.weightHistory.push(newRecord);
                
                const newCurrentWeight = getNewestWeight(pig.weightHistory);
                pig.weight = `${newCurrentWeight}kg`;

                addWeightModal.style.display = 'none';
                detailsModal.style.display = 'flex';
                
                Swal.fire({
                    icon: 'success',
                    title: 'Weight Added!',
                    text: `Weight record has been successfully added.`,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                
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

                const newCurrentWeight = getNewestWeight(pig.weightHistory);
                pig.weight = `${newCurrentWeight}kg`;
                
                editWeightModal.style.display = 'none';
                detailsModal.style.display = 'flex';
                
                Swal.fire({
                    icon: 'success',
                    title: 'Weight Updated!',
                    text: `Weight record has been successfully updated.`,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                
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

    // ------------------------------------------------------------
    // 14. GENERIC MODAL BACKDROP & CLOSE BUTTONS
    // ------------------------------------------------------------

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal') || e.target.classList.contains('notification-modal')) {
             closeAllModals();
        }
    });

    if (closeWeightModalBtn) {
        closeWeightModalBtn.addEventListener('click', function() {
            addWeightModal.style.display = 'none';
            detailsModal.style.display = 'flex';
        });
    }

    if (closeExpenseModalBtn) {
        closeExpenseModalBtn.addEventListener('click', function() {
            addExpenseModal.style.display = 'none';
            detailsModal.style.display = 'flex';
        });
    }

    if (closeVaccinationModalBtn) {
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

    if (btnCancelEditWeight) {
        btnCancelEditWeight.addEventListener('click', function() {
            editWeightModal.style.display = 'none';
            detailsModal.style.display = 'flex';
        });
    }

    if (clearExpenseFormBtn) {
        clearExpenseFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addExpenseForm.reset();
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('newExpenseDate').value = today;
        });
    }

    if (clearVaccinationFormBtn) {
        clearVaccinationFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addVaccinationForm.reset();
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('newVaccinationDate').value = today;
            
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            document.getElementById('newVaccinationDueDate').value = dueDate.toISOString().split('T')[0];
        });
    }

    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', function() {
            // check current pig status first
            const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);
            if (!pig) return;
            if (pig.status === 'sold' || pig.status === 'deceased') {
                Swal.fire('Not allowed', 'Cannot add expense to a sold or deceased pig.', 'warning');
                return;
            }
            openAddExpenseModal();
        });
    }

    if (addVaccinationBtn) {
        addVaccinationBtn.addEventListener('click', function() {
            const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);
            if (!pig) return;
            if (pig.status === 'sold' || pig.status === 'deceased') {
                Swal.fire('Not allowed', 'Cannot add vaccination to a sold or deceased pig.', 'warning');
                return;
            }
            openAddVaccinationModal();
        });
    }

    if (pigDetailsMenuIcon) {
        pigDetailsMenuIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            if (pigActionMenu) {
                pigActionMenu.classList.toggle('active');
            }
        });

        document.addEventListener('click', function() {
            if (pigActionMenu) {
                pigActionMenu.classList.remove('active');
            }
        });
    }

    if (editPigDetailsBtn) {
        editPigDetailsBtn.addEventListener('click', function() {
            if (pigActionMenu) pigActionMenu.classList.remove('active');
            const pig = getCurrentFarm()?.pigs.find(p => p.id === currentDetailPigId);
            if (!pig) return;
            if (pig.status === 'sold' || pig.status === 'deceased') {
                Swal.fire('Not allowed', 'This pig is sold or deceased — details cannot be edited.', 'warning');
                return;
            }
            openEditPigDetailsModal();
        });
    }

    if (deletePigBtn) {
        deletePigBtn.addEventListener('click', function() {
            if (pigActionMenu) pigActionMenu.classList.remove('active');
            deletePig(currentDetailPigId);
        });
    }

    if (closeEditPigDetailsModal) {
        closeEditPigDetailsModal.addEventListener('click', function() {
            editPigDetailsModal.style.display = 'none';
            detailsModal.style.display = 'flex';
        });
    }

    if (cancelEditPigDetails) {
        cancelEditPigDetails.addEventListener('click', function() {
            editPigDetailsModal.style.display = 'none';
            detailsModal.style.display = 'flex';
        });
    }

    if (editPigDetailsForm) {
        editPigDetailsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEditPigDetailsSubmit(); 
        });
    }

    if (newWeightImgInput) {
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

    if (tabAdd) tabAdd.addEventListener('click', addNewFarm);
    if (addPigBtn) addPigBtn.addEventListener('click', openAddPigModal);
    if (notificationBtn) notificationBtn.addEventListener('click', openNotificationModal);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

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

    // ------------------------------------------------------------
    // 15. EXPENSE & VACCINATION FORM HANDLERS
    // ------------------------------------------------------------

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
                    price: priceNumber,
                    category: categoryVal
                };

                if (!pig.expenseRecords) {
                    pig.expenseRecords = [];
                }

                pig.expenseRecords.push(newExpense);

                addExpenseForm.reset();
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('newExpenseDate').value = today;

                addExpenseModal.style.display = 'none';
                detailsModal.style.display = 'flex';
                
                updateDetailsTabContent(pig, 'expenses');
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

                if (!pig.vaccinationRecords) {
                    pig.vaccinationRecords = [];
                }

                pig.vaccinationRecords.push(newVaccination);

                addVaccinationForm.reset();
                
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('newVaccinationDate').value = today;
                
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 30);
                document.getElementById('newVaccinationDueDate').value = dueDate.toISOString().split('T')[0];

                addVaccinationModal.style.display = 'none';
                detailsModal.style.display = 'flex';
                
                updateDetailsTabContent(pig, 'health');
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

    // ------------------------------------------------------------
    // 16. TABLE SELECT-ALL, FILTERS, SEARCH
    // ------------------------------------------------------------

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

    function changeSelectedPigsStatus(newStatus) {
        const selectedPigs = Array.from(pigCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => parseInt(checkbox.dataset.pigId));
        
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

        const executeStatusChange = (pigsToUpdate, status) => {
            const currentFarm = getCurrentFarm();
            let changedCount = 0;

            pigsToUpdate.forEach(pigId => {
                const pig = currentFarm.pigs.find(p => p.id === pigId);
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

        if (newStatus === 'sold') {
            if (selectedPigs.length >= 1) {
                openPriceInputModal(selectedPigs);
                pigCheckboxes.forEach(checkbox => checkbox.checked = false);
                if (selectAllCheckbox) selectAllCheckbox.checked = false;
                if (tableSelectAllCheckbox) tableSelectAllCheckbox.checked = false;
                return;
            }
        }

        let titleText = '';
        let isConfirmed = false;

        if (newStatus === 'growing' || newStatus === 'tosale') {
            titleText = `Are you sure you want to mark ${selectedPigs.length} pig(s) as "${formatStatusText(newStatus)}"?`;
            isConfirmed = true;
        } else if (newStatus === 'deceased') {
            titleText = `Mark ${selectedPigs.length} pig(s) as Deceased?`;
            isConfirmed = true;
        }
        
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

        pigCheckboxes.forEach(checkbox => checkbox.checked = false);
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        if (tableSelectAllCheckbox) tableSelectAllCheckbox.checked = false;
    }

    // ------------------------------------------------------------
    // 17. BULK SALE PROCESS
    // ------------------------------------------------------------

    function openPriceInputModal(pigIds) {
        currentPigsForSaleIds = pigIds;
        calculatedTotalSalePrice = 0;
        pricePerPigInput = 0;

        const modalHeader = priceInputModal?.querySelector('.modal-header-sales h3');
        if (modalHeader) {
            // Treat the price input as price per kilogram (kg)
            modalHeader.textContent = `Enter Price Per kg (for ${pigIds.length} Pig${pigIds.length > 1 ? 's' : ''})`;
        }

        if (priceInputModal) {
            priceInputModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        if (priceInput) priceInput.value = '';
    }

    function showPriceConfirmation(pricePerPig) {
        if (priceInputModal) priceInputModal.style.display = 'none';

        const pigCount = currentPigsForSaleIds.length;
        const total = calculatedTotalSalePrice;

        const message = `You're setting the price at ₱<b>${pricePerPig.toFixed(2)}</b> per kg for <b>${pigCount}</b> pig(s).<br>
                         Total calculated price: ₱<b>${total.toFixed(2)}</b>.<br><br>Do you want to proceed?`;

        // show our in-app confirm modal instead of SweetAlert
        openCustomConfirm('Please confirm:', message, function() {
            // confirmed
            showSoldConfirmationModal();
        }, function() {
            // cancelled - reopen price modal
            if (priceInputModal) priceInputModal.style.display = 'flex';
        }, 'Yes', 'No');
    }

    function showSoldConfirmationModal() {
        if (priceInputModal) {
            priceInputModal.style.display = 'none'; 
        }
        
        if (finalSoldPriceDisplay) {
            finalSoldPriceDisplay.value = `₱${calculatedTotalSalePrice.toFixed(2)}`; 
        }
        // set details (per kg and pig count) if available
        const detailsEl = document.getElementById('soldConfirmationDetails');
        const pigCount = currentPigsForSaleIds.length;
        if (detailsEl) {
            detailsEl.innerHTML = `Price per kg: ₱<b>${pricePerPigInput.toFixed(2)}</b> — for <b>${pigCount}</b> pig(s).`;
        }
        
        if (soldConfirmationModal) {
            soldConfirmationModal.style.display = 'flex'; 
            document.body.style.overflow = 'hidden'; 
        }
    }

    function finalizeSale(totalPrice) {
        const pigCount = currentPigsForSaleIds.length;
        const saleDate = new Date().toISOString().split('T')[0];
        const avgPrice = pigCount ? (totalPrice / pigCount) : 0; // average total per pig

        if (pigCount === 0) return;

        const currentFarm = getCurrentFarm();
        let changedCount = 0;

        currentPigsForSaleIds.forEach(pigId => {
            const pig = getPigById(pigId);
            if (pig) {
                pig.status = 'sold';
                pig.weight = `Sold`;

                // record the per-pig sold price calculated from pricePerPigInput (per kg) × pig weight
                let pigWeight = 0;
                if (pig.weightHistory) pigWeight = getNewestWeight(pig.weightHistory);
                else if (pig.weightRecords && pig.weightRecords.length) pigWeight = pig.weightRecords[pig.weightRecords.length - 1].weight;
                else if (typeof pig.weightKg !== 'undefined') pigWeight = pig.weightKg;

                pig.soldPrice = (Number(pigWeight) || 0) * pricePerPigInput;

                pig.statusHistory.push({
                    date: saleDate,
                    status: 'sold',
                    notes: `Bulk sale of ${pigCount} pig(s). Total: ₱${totalPrice.toFixed(2)} (Avg. ₱${avgPrice.toFixed(2)} per pig).`
                });
                changedCount++;
            }
        });

        loadFarmData(currentFarmId);
        
        if (soldConfirmationModal) {
            soldConfirmationModal.style.display = 'none'; 
        }
        
        closeAllModals(); 

        Swal.fire({
            icon: 'success',
            title: 'Bulk Sale Confirmed!',
            text: `${changedCount} pig(s) successfully marked as sold for a total of ₱${totalPrice.toFixed(2)}.`,
            showConfirmButton: false,
            timer: 3000
        });
    }

    if (priceInputForm) {
        priceInputForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            // priceInput is price per kilogram — we'll compute per-pig totals by multiplying by each pig's weight
            const pricePerPig = parseFloat(priceInput.value);
            const pigCount = currentPigsForSaleIds.length;

            if (isNaN(pricePerPig) || pricePerPig <= 0 || pigCount === 0) {
                Swal.fire('Error', 'Please enter a valid price per kg and ensure at least one pig is selected.', 'error');
                return;
            }

            // Sum (pricePerKg * pigWeight) for each selected pig
            let total = 0;
            currentPigsForSaleIds.forEach(pid => {
                const p = getPigById(pid);
                if (!p) return;

                // support different weight fields used across the project
                let weight = 0;
                if (p.weightHistory) weight = getNewestWeight(p.weightHistory);
                else if (p.weightRecords && p.weightRecords.length) weight = p.weightRecords[p.weightRecords.length - 1].weight;
                else if (typeof p.weightKg !== 'undefined') weight = p.weightKg;
                else if (typeof p.weight !== 'undefined' && !isNaN(parseFloat(p.weight))) weight = parseFloat(p.weight);

                total += pricePerPig * (Number(weight) || 0);
            });

            calculatedTotalSalePrice = total;
            pricePerPigInput = pricePerPig;

            showPriceConfirmation(pricePerPig); 
        });
    }

    document.getElementById('clearPriceInput')?.addEventListener('click', function() {
        if (priceInput) priceInput.value = ''; 
    });

    document.getElementById('closePriceInputModal')?.addEventListener('click', function(e) {
        e.stopPropagation();
        if (priceInputModal) priceInputModal.style.display = 'none';
        currentPigsForSaleIds = [];
        calculatedTotalSalePrice = 0;
        pricePerPigInput = 0;
        document.body.style.overflow = 'auto';
    });

    if (confirmSoldPriceBtn) {
        confirmSoldPriceBtn.addEventListener('click', function() {
            if (currentPigsForSaleIds.length > 0 && calculatedTotalSalePrice > 0) {
                finalizeSale(calculatedTotalSalePrice); 
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Sale calculation error. Please try again.' });
                closeAllModals();
            }
        });
    }

    document.getElementById('cancelSoldPrice')?.addEventListener('click', function(e) {
        e.stopPropagation(); 
        if (soldConfirmationModal) soldConfirmationModal.style.display = 'none';
        currentPigsForSaleIds = [];
        calculatedTotalSalePrice = 0;
        pricePerPigInput = 0;
        document.body.style.overflow = 'auto';
    });

    document.getElementById('closeSoldConfirmationModal')?.addEventListener('click', function(e) {
        e.stopPropagation(); 
        if (soldConfirmationModal) soldConfirmationModal.style.display = 'none';
        currentPigsForSaleIds = [];
        calculatedTotalSalePrice = 0;
        pricePerPigInput = 0;
        document.body.style.overflow = 'auto';
    });

    // ------------------------------------------------------------
    // 18. COUNT UPDATES & SEARCH
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // 19. FARM CONTEXT MENU
    // ------------------------------------------------------------

    function showFarmContextMenu(farmId, event) {
        event.preventDefault();
        event.stopPropagation();
        
        currentContextFarmId = farmId;
        
        const farmTab = event.target.closest('.tab');
        if (!farmTab) return;

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
        
        function closeContextMenuHandler(e) {
            if (!farmContextMenu.contains(e.target) && !e.target.classList.contains('tab')) {
                farmContextMenu.classList.remove('active');
                document.removeEventListener('click', closeContextMenuHandler);
            }
        }
        
        document.addEventListener('click', closeContextMenuHandler);
    }

    function hideFarmContextMenu() {
        farmContextMenu.classList.remove('active');
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
        document.body.style.overflow = 'auto';
        currentContextFarmId = null;
        
        Swal.fire({
            icon: 'success',
            title: 'Farm Renamed!',
            text: `Farm has been renamed to "${trimmedName}".`,
            showConfirmButton: false,
            timer: 2000
        });
    }

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
                farms = farms.filter(f => f.id !== farmId);
                
                const farmTab = document.querySelector(`.tab[data-farm="${farmId}"]`);
                if (farmTab) {
                    farmTab.remove();
                }
                
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

    function openRenameFarmModal() {
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

    // ------------------------------------------------------------
    // 20. INIT
    // ------------------------------------------------------------

    function init() {
        loadFarmData(currentFarmId);
        
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('dblclick', function(e) {
                const farmId = parseInt(this.dataset.farm);
                showFarmContextMenu(farmId, e);
            });
        });

        // 🔹 Initialize floating label behavior once on load
        applyFloatingLabelListeners();
    }

    init();
});


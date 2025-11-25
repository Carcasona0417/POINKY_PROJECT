document.addEventListener('DOMContentLoaded', function() {

    // --- Initialize Variables (UNCHANGED) ---
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

    // NEW SALE MODAL ELEMENTS
    const priceInputModal = document.getElementById('priceInputModal');
    const priceInputForm = document.getElementById('priceInputForm');
    const pigPricePerKgInput = document.getElementById('pigPricePerKg');
    const soldConfirmationModal = document.getElementById('soldConfirmationModal');
    const finalSoldPriceDisplay = document.getElementById('finalSoldPriceDisplay');
    const confirmFinalSaleBtn = document.getElementById('confirmFinalSale');

    // NEW State Variables
    let currentPigForSaleId = null;
    let currentPigForSaleTotal = 0;

    // Edit Weight Modal elements
    const editWeightModal = document.getElementById('editWeightModal');
    const editWeightForm = document.getElementById('editWeightForm');
    const editWeightImgInput = document.getElementById('editWeightImg');
    const editFileNameDisplay = document.getElementById('editFileNameDisplay');
    const closeEditWeightModalBtn = document.getElementById('closeEditWeightModal');
    const btnCancelEditWeight = document.getElementById('btnCancelEditWeight'); // Added Cancel button for consistency

    // State Variables
    let currentDetailPigId = null;
    let currentEditWeightRecordIndex = null;


    // Farm data storage - Start with initial data structure
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

    // --- Helper & Modal Management (UNCHANGED) ---

    function formatStatusText(status) {
        const statusMap = {
            'growing': 'Growing',
            'tosale': 'To Sale',
            'sold': 'Sold',
            'deceased': 'Deceased'
        };
        return statusMap[status] || status;
    }

    function closeAllModals() {
        const modals = document.querySelectorAll('.modal, .notification-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
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

        tabsContainer.insertBefore(newTab, tabAdd);

        newTab.addEventListener('click', function() {
            switchToFarm(newFarm.id);
        });

        switchToFarm(newFarm.id);

        nextFarmId++;
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

    // --- Pig Management (UNCHANGED) ---

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


    // --- 🐷 Pig Details & Weight Management Functions ---

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

        if (tabId === 'weight') {
            btnOpenAddWeight.textContent = 'Add Weight Record';
            btnOpenAddWeight.onclick = openAddWeightModal;
            btnOpenAddWeight.style.display = 'inline-block';
        } else {
            btnOpenAddWeight.style.display = 'none';
        }
    }
    
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

    // --- 🗑️ DELETE WEIGHT RECORD LOGIC (UPDATED to use getNewestWeight) ---
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

    // --- Form Handlers ---

    // Add Pig Form (UNCHANGED)
    if (addPigForm) {
        addPigForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // --- 1. Collect Data ---
            const pigData = {
                name: document.getElementById('pigName').value.trim(),
                breed: document.getElementById('pigBreed').value,
                gender: document.getElementById('pigGender').value,
                age: document.getElementById('pigAge').value, 
                date: document.getElementById('pigDate').value,
                initialWeight: document.getElementById('pigWeight').value
            };

            // --- 2. Check for Required Fields ---
            // If ALL fields are filled out, execute the save logic.
            if (Object.values(pigData).every(val => val !== '' && val !== null)) {
                
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

    function openSuccessModal() {
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    const clearAddPigFormBtn = document.getElementById('clearAddPigForm');
        if (clearAddPigFormBtn) {
            clearAddPigFormBtn.addEventListener('click', function() {
                addPigForm.reset();
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('pigDate').value = today; // Reset date to today
            });
        }

    // Add Weight Form (UPDATED to use getNewestWeight for consistency)
    if(addWeightForm) {
        addWeightForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const dateVal = document.getElementById('newWeightDate').value;
            const weightVal = document.getElementById('newWeightValue').value;

            if (!dateVal || !weightVal) {
                alert('Please enter a date and weight.');
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
                // Call openPigDetails to ensure the detail sidebar is updated
                window.openPigDetails(pig.id); // This will call updateDetailsTabContent and update all counts
                // updateDetailsTabContent(pig, 'weight'); // Not strictly needed if openPigDetails is called
                // loadFarmData(currentFarmId); // Not strictly needed if openPigDetails is called

                addWeightForm.reset();
            } else {
                 alert('Error: Pig not found.');
                 addWeightModal.style.display = 'none';
            }
        });
    }

    // Edit Weight Form (CRITICALLY UPDATED to use getNewestWeight)
    if (editWeightForm) {
        editWeightForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const dateVal = document.getElementById('editWeightDate').value;
            const weightVal = document.getElementById('editWeightValue').value;

            if (!dateVal || !weightVal) {
                alert('Please enter a date and weight.');
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

                // --- FIX: Recalculate and update current weight based on newest date ---
                const newCurrentWeight = getNewestWeight(pig.weightHistory);
                pig.weight = `${newCurrentWeight}kg`;
                
                // If the edited weight is now the newest, the table must update the current weight column.
                
                // ------------------------------------------------------------------------

                editWeightModal.style.display = 'none';
                detailsModal.style.display = 'flex';
                
                // Call openPigDetails to ensure the detail sidebar is updated with the new current weight
                window.openPigDetails(pig.id); 
                // loadFarmData(currentFarmId); // Now called within openPigDetails
                
                this.reset();
            } else {
                alert('Error: Could not save changes.');
            }
            currentEditWeightRecordIndex = null;
        });
    }
    
    // Custom button click handler for Edit Cancel
    if (btnCancelEditWeight) {
        btnCancelEditWeight.addEventListener('click', function() {
            editWeightModal.style.display = 'none';
            detailsModal.style.display = 'flex';
        });
    }

    // --- Event Listeners for UI interaction (Modals, Tabs, Filters) (UNCHANGED) ---

    // Modal Close Listeners
    document.addEventListener('click', function(e) {
        if (e.target.id.startsWith('close') ||
            e.target.classList.contains('modal') ||
            e.target.classList.contains('notification-modal')) {
            closeAllModals();
        }
    });

    if(closeWeightModalBtn) {
        closeWeightModalBtn.addEventListener('click', function() {
            addWeightModal.style.display = 'none';
            detailsModal.style.display = 'flex';
        });
    }

    if (closeEditWeightModalBtn) {
        closeEditWeightModalBtn.addEventListener('click', function() {
            editWeightModal.style.display = 'none';
            detailsModal.style.display = 'flex';
        });
    }

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
// ✅ MODIFIED: Status Change Logic (Handles 'growing', 'tosale', 'sold', and 'deceased' FLOW)
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

    // --- 2. Helper function to EXECUTE the status change ---
// Helper function for non-sale status changes
// Helper function for non-sale status changes
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
        // 1. Update the data
        loadFarmData(currentFarmId);
        
        // 2. Display the standard success message for all non-sale updates
        
        // Define the success message text
        let successText = `${changedCount} pig(s) successfully changed to ${formatStatusText(status)}.`;
        
        // Customize the title text for Deceased status (if desired)
        let successTitle = (status === 'deceased') ? 'Pig Status Finalized!' : 'Status Updated!';

        Swal.fire({
            icon: 'success', // ⭐ STANDARD GREEN CHECK MARK ICON ⭐
            title: successTitle,
            text: successText,
            showConfirmButton: false,
            timer: 2000
        });
    }
};

    // --- 3. Confirmation Logic Setup ---
    let titleText = '';
    let isConfirmed = false;

    if (newStatus === 'growing') {
        titleText = `Are you sure you want to mark ${selectedPigs.length} pig(s) as "Growing"?`;
        isConfirmed = true;
    } else if (newStatus === 'tosale') {
        titleText = `Are you sure you want to mark ${selectedPigs.length} pig(s) as "To Sale"?`;
        isConfirmed = true;
    } else if (newStatus === 'deceased') {
        // ⭐ NEW DECEASED CONFIRMATION LOGIC ⭐
        titleText = `Mark ${selectedPigs.length} pig(s) as Deceased?`;
        isConfirmed = true;
        // The detailed "You won't be able to undo this later" message will go inside the Swal.fire call below
    }
    
    // --- 4. SPECIAL HANDLING FOR 'SOLD' (Single-Pig Flow) ---
    if (newStatus === 'sold') {
        // ... (existing SOLD logic remains the same) ...
        if (selectedPigs.length > 1) {
             Swal.fire({
                 icon: 'info',
                 title: 'One Pig at a Time',
                 text: 'The detailed sale process requires you to enter a price per kg for each pig individually. Please select only one pig to proceed with the sale.',
             });
             pigCheckboxes.forEach(checkbox => checkbox.checked = false);
             selectAllCheckbox.checked = false;
             tableSelectAllCheckbox.checked = false;
             return; 
        }
        if (selectedPigs.length === 1) {
            openPriceInputModal(selectedPigs[0]);
            pigCheckboxes.forEach(checkbox => checkbox.checked = false);
            selectAllCheckbox.checked = false;
            tableSelectAllCheckbox.checked = false;
            return;
        }
    }

    // --- 5. Execute Confirmed/Default Status Changes ---
    if (isConfirmed) {
        Swal.fire({
            title: titleText,
            // Custom text for deceased status
            html: newStatus === 'deceased' ? titleText + '<br><small style="color:#888;">You won\'t be able to undo this later.</small>' : titleText,
            icon: newStatus === 'deceased' ? 'warning' : 'question', // Use warning icon for deceased
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Proceed',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                executeStatusChange(selectedPigs, newStatus);
            }
             // Final Cleanup (checkboxes) is handled below or by the user action
        });
    } 
    // The final 'else' block which used to execute 'deceased' without confirmation is now gone!

    // Final Cleanup (only necessary if the function hasn't already returned)
    pigCheckboxes.forEach(checkbox => checkbox.checked = false);
    selectAllCheckbox.checked = false;
    tableSelectAllCheckbox.checked = false;
}//end of pig status


// =========================================================================
// 🐖 SALE PROCESS FUNCTIONS (4-STEP FLOW)
// =========================================================================

function getPigWeightInKg(pigId) {
    const pig = getPigById(pigId);
    if (!pig) return 0;
    
    // Uses the existing helper to get the latest weight
    return getNewestWeight(pig.weightHistory); 
}

// Step 1: Open the Price Input Modal (image_0d395e.png)
function openPriceInputModal(pigId) {
    currentPigForSaleId = pigId;
    priceInputModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    pigPricePerKgInput.value = ''; // Ensure input is clear
}

// Step 2: Confirmation based on price per kg (SweetAlert/image_0d393f.png)
function showPriceConfirmation(pricePerKg) {
    const pigWeight = getPigWeightInKg(currentPigForSaleId);
    if (pigWeight <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Pig has no recorded weight. Sale cannot be processed.',
        });
        closeAllModals();
        return;
    }

    currentPigForSaleTotal = pigWeight * pricePerKg; // Calculate total price
    
    // SweetAlert Confirmation (Text matches image_0d393f.png style)
    Swal.fire({
        title: 'Please confirm:',
        html: `You're setting the price at ₱**${pricePerKg.toFixed(2)}** per kilogram for this pig.<br><br>Do you want to proceed?`,
        icon: undefined, 
        showCancelButton: true,
        confirmButtonColor: '#2ECC71', 
        cancelButtonColor: '#E74C3C', 
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        // ADD THIS NEW LINE:
        customClass: {
            popup: 'swal2-confirm-price' // Apply a custom class to the SweetAlert popup
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Proceed to Step 3
            showSoldConfirmationModal();
        } else {
            // Cancel sale process
            closeAllModals();
        }
    });
}

// Step 3: Final Sold Confirmation Modal (image_0d3920.png)
function showSoldConfirmationModal() {
    priceInputModal.style.display = 'none'; 
    finalSoldPriceDisplay.value = `₱${currentPigForSaleTotal.toFixed(2)}`;
    soldConfirmationModal.style.display = 'flex';
}

// Step 4: Finalize Sale and Update Status
function finalizeSale(totalPrice) {
    const pig = getPigById(currentPigForSaleId);
    if (pig) {
        pig.status = 'sold';
        // Update the main table column with the final price
        pig.weight = `Sold: ₱${totalPrice.toFixed(2)}`; 
        pig.statusHistory.push({
            date: new Date().toISOString().split('T')[0],
            status: 'sold',
            notes: `Sold for ₱${totalPrice.toFixed(2)} at ₱${pigPricePerKgInput.value} per kg.`
        });
        
        loadFarmData(currentFarmId);
        closeAllModals();

        // Success Alert
        Swal.fire({
            icon: 'success',
            title: 'Sale Confirmed!',
            text: `${pig.name} (ID: ${pig.shortId}) was successfully marked as sold for ₱${totalPrice.toFixed(2)}.`,
            showConfirmButton: false,
            timer: 3000
        });

        // --- Price Input Modal Listeners (Step 1 -> Step 2) ---
        if (priceInputForm) {
            priceInputForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const pricePerKg = parseFloat(pigPricePerKgInput.value);
                if (pricePerKg > 0) {
                    priceInputModal.style.display = 'none';
                    showPriceConfirmation(pricePerKg); // Go to Step 2
                } else {
                    Swal.fire({ icon: 'warning', title: 'Invalid Price', text: 'Please enter a valid price.' });
                }
            });
        }
        document.getElementById('clearPriceInput')?.addEventListener('click', function() {
            pigPricePerKgInput.value = '';
        });
        document.getElementById('closePriceInputModal')?.addEventListener('click', closeAllModals);


        // --- Sold Confirmation Modal Listeners (Step 3 -> Step 4) ---
        document.getElementById('cancelSoldConfirmation')?.addEventListener('click', closeAllModals);
        document.getElementById('closeSoldConfirmationModal')?.addEventListener('click', closeAllModals);

        if (confirmFinalSaleBtn) {
            confirmFinalSaleBtn.addEventListener('click', function() {
                if (currentPigForSaleId && currentPigForSaleTotal > 0) {
                    finalizeSale(currentPigForSaleTotal); // Go to Step 4
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Sale calculation error. Please try again.' });
                    closeAllModals();
                }
            });
        }
    }
}


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

    // --- Initialize the application ---
    function init() {
        // Load initial farm data
        loadFarmData(currentFarmId);
    }

    // Start the application
    init();
});
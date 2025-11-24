document.addEventListener('DOMContentLoaded', function() {
    
    // --- Initialize Variables ---
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

    // Farm data storage - Start with empty arrays
    let farms = [
        { id: 1, name: 'Farm 1', pigs: [] },
        { id: 2, name: 'Farm 2', pigs: [] },
        { id: 3, name: 'Farm 3', pigs: [] }
    ];
    
    let currentFarmId = 1;
    let nextFarmId = 4;
    let nextPigId = 1;

    // --- Farm Management ---
    tabAdd.addEventListener('click', function() {
        addNewFarm();
    });

    function addNewFarm() {
        const newFarm = {
            id: nextFarmId,
            name: `Farm ${nextFarmId}`,
            pigs: []
        };
        
        farms.push(newFarm);
        
        // Create new tab
        const newTab = document.createElement('button');
        newTab.className = 'tab';
        newTab.setAttribute('role', 'tab');
        newTab.setAttribute('aria-selected', 'false');
        newTab.setAttribute('data-farm', newFarm.id);
        newTab.textContent = newFarm.name;
        
        // Insert before the add button
        tabsContainer.insertBefore(newTab, tabAdd);
        
        // Add click event to new tab
        newTab.addEventListener('click', function() {
            switchToFarm(newFarm.id);
        });
        
        // Switch to the new farm
        switchToFarm(newFarm.id);
        
        nextFarmId++;
        console.log(`Added new farm: ${newFarm.name}`);
    }

    function switchToFarm(farmId) {
        // Update tabs
        tabs.forEach(tab => tab.classList.remove('active'));
        const currentTab = document.querySelector(`.tab[data-farm="${farmId}"]`);
        if (currentTab) {
            currentTab.classList.add('active');
        }
        
        currentFarmId = farmId;
        loadFarmData(farmId);
    }

    // --- Pig Management ---
    function openAddPigModal() {
        if (addPigModal) {
            addPigModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Set current date as default
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('pigDate').value = today;
            
            document.getElementById('pigName').focus();
        }
    }

    function addNewPig(pigData) {
        const currentFarm = farms.find(farm => farm.id === currentFarmId);
        if (!currentFarm) return;

        const newPig = {
            id: nextPigId,
            ...pigData,
            shortId: pigData.name.substring(0, 3),
            age: `${pigData.age} mo.`,
            weight: `${pigData.initialWeight}kg`,
            status: 'growing'
        };

        currentFarm.pigs.push(newPig);
        nextPigId++;

        // Refresh the table
        loadFarmData(currentFarmId);
        
        console.log(`Added new pig: ${pigData.name} to ${currentFarm.name}`);
    }

    // --- Form Handling ---
    if (addPigForm) {
        addPigForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const pigData = {
                name: document.getElementById('pigName').value.trim(),
                breed: document.getElementById('pigBreed').value,
                gender: document.getElementById('pigGender').value,
                age: document.getElementById('pigAge').value,
                date: document.getElementById('pigDate').value,
                initialWeight: document.getElementById('pigWeight').value
            };
            
            if (pigData.name && pigData.breed && pigData.gender && pigData.age && pigData.date && pigData.initialWeight) {
                addNewPig(pigData);
                closeAllModals();
                this.reset();
                
                // Reset date to today
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('pigDate').value = today;
            }
        });
    }

    // Clear form button
    document.getElementById('clearPigForm')?.addEventListener('click', function() {
        document.getElementById('addPigForm').reset();
        // Reset date to today after clear
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('pigDate').value = today;
    });

    // --- Modal Management ---
    if (addPigBtn) {
        addPigBtn.addEventListener('click', openAddPigModal);
    }

    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            openNotificationModal();
        });
    }

    // Close modals
    document.addEventListener('click', function(e) {
        if (e.target.id === 'closePigModal' || e.target.id === 'closeNotificationModal') {
            closeAllModals();
        }
        
        if (e.target.classList.contains('modal') || e.target.classList.contains('notification-modal')) {
            closeAllModals();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

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

    // --- Existing Table Functionality ---
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

    function loadFarmData(farmId) {
        const currentFarm = farms.find(farm => farm.id === farmId);
        if (!currentFarm) return;

        // Clear existing table rows
        pigsTableBody.innerHTML = '';

        if (currentFarm.pigs.length === 0) {
            // Show empty state
            pigsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-farm">
                        <div class="empty-farm-message">No pigs added yet.</div>
                    </td>
                </tr>
            `;
        } else {
            // Populate with pigs
            currentFarm.pigs.forEach(pig => {
                const row = createPigRow(pig);
                pigsTableBody.appendChild(row);
            });
        }

        // Update checkboxes and counts
        pigCheckboxes = document.querySelectorAll('.pig-checkbox');
        pigRows = document.querySelectorAll('.pig-row');
        setupSelectAllCheckbox(selectAllCheckbox, pigCheckboxes);
        setupSelectAllCheckbox(tableSelectAllCheckbox, pigCheckboxes);
        updatePigCounts();
        updateFilterCounts();
        
        console.log(`Loaded data for ${currentFarm.name}`);
    }

    // --- UPDATED: Create Pig Row (Badge Only & Clickable) ---
    function createPigRow(pig) {
        const row = document.createElement('tr');
        row.className = `pig-row ${pig.status === 'sold' || pig.status === 'deceased' ? 'inactive' : ''}`;
        row.setAttribute('data-id', pig.id);
        row.setAttribute('data-status', pig.status);

        const isInactive = pig.status === 'sold' || pig.status === 'deceased';
        
        row.innerHTML = `
            <td class="col-checkbox">
                <input type="checkbox" class="pig-checkbox" data-pig-id="${pig.id}" ${isInactive ? 'disabled' : ''}>
            </td>
            <td class="col-name">
                <span class="pig-id-badge clickable-badge" onclick="window.openPigDetails(${pig.id})">
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

    // --- NEW FEATURE: Pig Details Modal Logic ---
    
    // Expose this function to window so the onclick in HTML can find it
    window.openPigDetails = function(pigId) {
        const currentFarm = farms.find(farm => farm.id === currentFarmId);
        const pig = currentFarm.pigs.find(p => p.id === pigId);
        
        if (!pig) return;

        // 1. Populate Left Side (Pig Info)
        document.getElementById('detailName').textContent = pig.name;
        document.getElementById('detailBreed').textContent = pig.breed;
        document.getElementById('detailGender').textContent = pig.gender.charAt(0).toUpperCase() + pig.gender.slice(1);
        document.getElementById('detailDate').textContent = pig.date; // Date acquired
        document.getElementById('detailInitialWeight').textContent = pig.initialWeight + ' kg'; // Assuming saved as number
        document.getElementById('detailCurrentWeight').textContent = pig.weight; // Assuming saved as string "XXkg"
        document.getElementById('detailStatus').textContent = formatStatusText(pig.status);

        // 2. Populate Right Side (Weight Records - Dummy Data for Demo)
        const tbody = document.getElementById('weightRecordsBody');
        tbody.innerHTML = ''; // Clear previous

        // Generate dummy history based on current weight
        // In a real app, this would come from pig.weightHistory array
        const currentW = parseFloat(pig.weight) || 0;
        const history = [
            { date: 'Today', weight: currentW, img: 'Dash Icons/WPig.png' },
            { date: '2 weeks ago', weight: (currentW * 0.9).toFixed(1), img: 'Dash Icons/WPig.png' },
            { date: '1 month ago', weight: (currentW * 0.8).toFixed(1), img: 'Dash Icons/WPig.png' }
        ];

        history.forEach(rec => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rec.date}</td>
                <td>${rec.weight} kg</td>
                <td><img src="${rec.img}" class="pig-thumb" alt="pig"></td>
            `;
            tbody.appendChild(tr);
        });

        // 3. Show Modal
        const modal = document.getElementById('pigDetailsModal');
        modal.style.display = 'flex'; // Using flex to center
        document.body.style.overflow = 'hidden';
    };

    // Close Details Modal Logic
    const closeDetailsBtn = document.getElementById('closeDetailsModal');
    const detailsModal = document.getElementById('pigDetailsModal');

    if(closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', function() {
            detailsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Tab Switching Logic inside Details Modal
    const detailTabs = document.querySelectorAll('.detail-tab');
    detailTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            detailTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.details-main .tab-content').forEach(c => c.style.display = 'none');

            // Add active to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            const content = document.getElementById(`tab-${tabId}`);
            if(content) {
                content.style.display = 'block';
                if(tabId === 'weight') content.style.display = 'block'; // Ensure block
            }
        });
    });

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

    function searchPigs(searchTerm) {
        const rows = document.querySelectorAll('.pig-row');
        let visibleCount = 0;

        rows.forEach(row => {
            const pigName = row.querySelector('.pig-fullname')?.textContent.toLowerCase() || '';
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

    function changeSelectedPigsStatus(newStatus) {
        const selectedPigs = Array.from(pigCheckboxes)
            .filter(cb => cb.checked && !cb.disabled)
            .map(cb => cb.dataset.pigId);

        if (selectedPigs.length === 0) {
            alert('Please select at least one pig to change status.');
            return;
        }

        const currentFarm = farms.find(farm => farm.id === currentFarmId);
        if (!currentFarm) return;

        selectedPigs.forEach(pigId => {
            const pig = currentFarm.pigs.find(p => p.id == pigId);
            if (pig) {
                pig.status = newStatus;
            }
        });

        loadFarmData(currentFarmId);
    }

    function updatePigCounts() {
        const currentFarm = farms.find(farm => farm.id === currentFarmId);
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
        const currentFarm = farms.find(farm => farm.id === currentFarmId);
        if (!currentFarm) return;

        const counts = {
            all: currentFarm.pigs.length,
            growing: currentFarm.pigs.filter(p => p.status === 'growing').length,
            tosale: currentFarm.pigs.filter(p => p.status === 'tosale').length,
            sold: currentFarm.pigs.filter(p => p.status === 'sold').length,
            deceased: currentFarm.pigs.filter(p => p.status === 'deceased').length
        };

        // Update filter counts
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

    function formatStatusText(status) {
        const statusMap = {
            'growing': 'Growing',
            'tosale': 'To Sale',
            'sold': 'Sold',
            'deceased': 'Deceased'
        };
        return statusMap[status] || status;
    }

    // Initialize event listeners for tabs and filters
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

    // --- Initialize the application ---
    function init() {
        // Load initial farm data
        loadFarmData(currentFarmId);
        console.log('Pig Management System initialized');
    }

    // Start the application
    init();
});

// --- ADD WEIGHT MODAL LOGIC ---

    const addWeightModal = document.getElementById('addWeightModal');
    const btnOpenAddWeight = document.querySelector('.btn-add-record'); // Target the button in Details Modal
    const closeWeightModalBtn = document.getElementById('closeWeightModal');
    const addWeightForm = document.getElementById('addWeightForm');
    const newWeightImgInput = document.getElementById('newWeightImg');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    // Open "Add Weight" Modal
    if(btnOpenAddWeight) {
        btnOpenAddWeight.addEventListener('click', function() {
            addWeightModal.style.display = 'flex';
            
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('newWeightDate').value = today;
        });
    }

    // Close Modal
    if(closeWeightModalBtn) {
        closeWeightModalBtn.addEventListener('click', function() {
            addWeightModal.style.display = 'none';
        });
    }

    // Update File Name when image selected
    if(newWeightImgInput) {
        newWeightImgInput.addEventListener('change', function() {
            if(this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.color = '#333';
                fileNameDisplay.style.fontStyle = 'normal';
            } else {
                fileNameDisplay.textContent = 'Upload Image';
            }
        });
    }

    // Clear Form
    document.getElementById('clearWeightForm')?.addEventListener('click', function() {
        addWeightForm.reset();
        fileNameDisplay.textContent = 'Upload Image';
        // Reset date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newWeightDate').value = today;
    });

    // Save Weight Record
    if(addWeightForm) {
        addWeightForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 1. Get Values
            const dateVal = document.getElementById('newWeightDate').value;
            const weightVal = document.getElementById('newWeightValue').value;
            
            // Format Date (e.g., "2025-09-10" -> "Sept 10")
            const dateObj = new Date(dateVal);
            const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // 2. Add to Table (Prepend to show newest first)
            const tbody = document.getElementById('weightRecordsBody');
            const newRow = document.createElement('tr');
            
            // Determine image source (placeholder or uploaded file preview)
            let imgSrc = 'Dash Icons/WPig.png'; // Default
            if(newWeightImgInput.files && newWeightImgInput.files[0]) {
                imgSrc = URL.createObjectURL(newWeightImgInput.files[0]);
            }

            newRow.innerHTML = `
                <td>${dateString}</td>
                <td>${weightVal} kg</td>
                <td><img src="${imgSrc}" class="pig-thumb" alt="pig"></td>
            `;

            // Insert at the top of the table
            if(tbody.firstChild) {
                tbody.insertBefore(newRow, tbody.firstChild);
            } else {
                tbody.appendChild(newRow);
            }

            // 3. Update "Current Weight" in the Side Panel
            const currentWeightDisplay = document.getElementById('detailCurrentWeight');
            if(currentWeightDisplay) {
                currentWeightDisplay.textContent = weightVal + ' kg';
                
                // Add a quick animation to show it updated
                currentWeightDisplay.style.color = '#4CAF50';
                setTimeout(() => {
                    currentWeightDisplay.style.color = ''; // Revert to CSS color
                }, 1000);
            }
            
            // 4. Close Modal and Reset
            addWeightModal.style.display = 'none';
            addWeightForm.reset();
            fileNameDisplay.textContent = 'Upload Image';
        });
    }
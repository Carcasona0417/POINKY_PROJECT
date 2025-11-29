document.addEventListener('DOMContentLoaded', () => {
    /* ----------------------------------------------------
       ELEMENT REFERENCES
    ---------------------------------------------------- */
    const addPigBtn     = document.getElementById('addPigBtn');
    const addRemModal   = document.getElementById('addRem');
    const closeModalBtn = document.getElementById('CloseModal');
    const clearBtn      = addRemModal?.querySelector('.btn-clear');
    const saveBtn       = addRemModal?.querySelector('.btn-save');

    const dateInput     = document.getElementById('pigDate');
    const dateWrapper   = addRemModal?.querySelector('.date-wrapper');
    const calendarIcon  = addRemModal?.querySelector('.calendar-icon');

    const weightWrapper = addRemModal?.querySelector('.weight-wrapper');
    const priceInput    = weightWrapper ? weightWrapper.querySelector('input[type="number"]') : null;

    // selects inside modal (farm, pig, category)
    const selectElements = addRemModal ? addRemModal.querySelectorAll('.form-select') : [];
    const farmSelect     = selectElements[0];
    const pigSelect      = selectElements[1];
    const categorySelect = selectElements[2];

    // FULL LIST EXPENSES TABLE ELEMENTS
    const expensesTbody         = document.getElementById('expensesTableBody');
    const showingCountExpenses  = document.getElementById('showingCountExpenses');
    const totalCountExpenses    = document.getElementById('totalCountExpenses');
    const prevExpensesBtn       = document.getElementById('prevExpenses');
    const nextExpensesBtn       = document.getElementById('nextExpenses');
    const pageExpensesLabel     = document.getElementById('pageExpenses');

    // PIGS SOLD TABLE ELEMENTS
    const soldTbody         = document.getElementById('soldTableBody');
    const showingCountSold  = document.getElementById('showingCountSold');
    const totalCountSold    = document.getElementById('totalCountSold');
    const prevSoldBtn       = document.getElementById('prevSold');
    const nextSoldBtn       = document.getElementById('nextSold');
    const pageSoldLabel     = document.getElementById('pageSold');

    // Setup the Chart Context
    const ctx   = document.getElementById('chart').getContext('2d');
   /* ----------------------------------------------------
       Chart for income and expenses
       (static data for now)
    ---------------------------------------------------- */

    const data ={
        labels: [
            'Jan','Feb','Mar','Apr',
            'May','Jun','Jul','Aug',
            'Sep','Oct','Nov','Dec'
        ],
        datasets: [
            {
                label: 'Income',
                data: [5000,6000,8000,4000,7000,3000,10000,9000,8500,9500,11000,13000],
                backgroundColor: '#5dd05d',
                hoverBackgroundColor: '#7dde7d',
                barPercentage: 0.65,
                categoryPercentage: 0.8,
                borderRadius: 4
            },
              {
                label: 'Expenses',
                data: [3000,3500,5000,2000,4500,1500,7000,6000,5000,6500,7000,9000],
                backgroundColor: '#F16877',
                hoverBackgroundColor: '#F16877',
                barPercentage: 0.65,
                categoryPercentage: 0.8,
                borderRadius: 4
            }
        ]
    };
    // Create the Income & Expenses Bar Chart
    

        const incomeExpensesChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const value = context.raw || 0;
                                return context.dataset.label + ': ₱' + value.toLocaleString('en-PH');
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: false,
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₱' + value.toLocaleString('en-PH');
                            }
                        }
                    }
                }
            }
        });




    /* ----------------------------------------------------
       SIMPLE DATA SOURCES
       (Replace with DB or backend data later)
    ---------------------------------------------------- */

    let expensesData = [
        { date: '2025-09-20', farm: 'Farm 001', pig: 'Pig 001', category: 'Feed',     price: 900 },
        { date: '2025-09-18', farm: 'Farm 002', pig: 'Pig 004', category: 'Medicine', price: 350 },
        { date: '2025-09-15', farm: 'Farm 001', pig: 'Pig 002', category: 'Labor',    price: 500 }
    ];

    let soldData = [
        { dateSold: '2025-09-19', farm: 'Farm 001', pig: 'Pig 003', weight: '82kg', pricePerKg: 260, totalPrice: 21320, cancelled: false },
        { dateSold: '2025-09-10', farm: 'Farm 002', pig: 'Pig 005', weight: '75kg', pricePerKg: 250, totalPrice: 18750, cancelled: false }
    ];

    let isEditing = false;
    let editingIndex = null;


    /* ----------------------------------------------------
       PAGINATION STATE
    ---------------------------------------------------- */
    const PAGE_SIZE_EXPENSES = 5;
    const PAGE_SIZE_SOLD     = 5;

    let currentExpensesPage = 1;
    let currentSoldPage     = 1;

    /* ----------------------------------------------------
       HELPER FUNCTIONS
    ---------------------------------------------------- */

    function formatCurrency(value) {
        const num = Number(value) || 0;
        return '₱' + num.toLocaleString('en-PH');
    }

    function formatDateToLabel(dateStr) {
        if (!dateStr || !dateStr.includes('-')) return dateStr;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const parts = dateStr.split('-');
        const year  = parts[0];
        const monthIndex = Number(parts[1]) - 1;
        const day   = Number(parts[2]);
        return `${months[monthIndex]} ${day}`; // e.g., "Sep 12"
    }

    /* ----------------------------------------------------
       FLOATING LABEL HELPERS (TEXT, NUMBER, TEXTAREA, SELECT)
    ---------------------------------------------------- */

    function toggleHasValue(el) {
        if (!el) return;
        if (el.value && el.value.toString().trim() !== '') {
            el.classList.add('has-value');
        } else {
            el.classList.remove('has-value');
        }
    }

    if (addRemModal) {
        const textInputs = addRemModal.querySelectorAll('.input-wrapper input[type="text"], .input-wrapper input[type="number"]');
        const textareas  = addRemModal.querySelectorAll('.input-wrapper textarea');
        const selectElems = addRemModal.querySelectorAll('.input-wrapper select');

        textInputs.forEach(inp => {
            toggleHasValue(inp);
            inp.addEventListener('input', () => toggleHasValue(inp));
            inp.addEventListener('blur',  () => toggleHasValue(inp));
        });

        textareas.forEach(area => {
            toggleHasValue(area);
            area.addEventListener('input', () => toggleHasValue(area));
            area.addEventListener('blur',  () => toggleHasValue(area));
        });

        selectElems.forEach(sel => {
            toggleHasValue(sel);
            sel.addEventListener('change', () => toggleHasValue(sel));
            sel.addEventListener('blur',   () => toggleHasValue(sel));
        });
    }

    /* ----------------------------------------------------
       DATE WRAPPER ANIMATION (is-focused / has-value)
    ---------------------------------------------------- */

    function updateDateWrapperState() {
        if (!dateWrapper || !dateInput) return;
        if (dateInput.value) {
            dateWrapper.classList.add('has-value');
        } else {
            dateWrapper.classList.remove('has-value');
        }
    }

    if (dateInput && dateWrapper) {
        dateInput.addEventListener('focus', () => {
            dateWrapper.classList.add('is-focused');
        });

        dateInput.addEventListener('blur', () => {
            dateWrapper.classList.remove('is-focused');
            updateDateWrapperState();
        });

        dateInput.addEventListener('change', updateDateWrapperState);

        // initial
        updateDateWrapperState();
    }

    // Calendar icon opens native picker / focuses input
    if (calendarIcon && dateInput) {
        calendarIcon.addEventListener('click', () => {
            if (typeof dateInput.showPicker === 'function') {
                dateInput.showPicker();
            } else {
                dateInput.focus();
            }
        });
    }

    /* ----------------------------------------------------
       WEIGHT WRAPPER FOCUS (for unit-box pink state)
    ---------------------------------------------------- */
    if (weightWrapper && priceInput) {
        priceInput.addEventListener('focus', () => {
            weightWrapper.classList.add('is-focused');
        });
        priceInput.addEventListener('blur', () => {
            weightWrapper.classList.remove('is-focused');
        });
    }

    /* ----------------------------------------------------
       EDIT SOLD MODAL - FLOATING LABELS SETUP
    ---------------------------------------------------- */
    const editSoldModalElement = document.getElementById('editSoldModal');
    if (editSoldModalElement) {
        const editSoldDateInput = document.getElementById('editDateSold');
        const editSoldWeightInput = document.getElementById('editWeightSold');
        const editSoldPriceInput = document.getElementById('editPricePerKg');
        const editSoldTotalPriceInput = document.getElementById('editTotalPrice');

        // Handle date wrapper for edit modal
        if (editSoldDateInput) {
            const editDateWrapper = editSoldDateInput.closest('.date-wrapper');
            if (editDateWrapper) {
                const updateEditDateWrapperState = () => {
                    if (editSoldDateInput.value) {
                        editDateWrapper.classList.add('has-value');
                    } else {
                        editDateWrapper.classList.remove('has-value');
                    }
                };

                editSoldDateInput.addEventListener('focus', () => {
                    editDateWrapper.classList.add('is-focused');
                });
                editSoldDateInput.addEventListener('blur', () => {
                    editDateWrapper.classList.remove('is-focused');
                    updateEditDateWrapperState();
                });
                editSoldDateInput.addEventListener('change', updateEditDateWrapperState);
                updateEditDateWrapperState();
            }
        }

        // Handle weight and price inputs for floating labels
        const editWeightInputs = editSoldModalElement.querySelectorAll('.weight-wrapper input');
        editWeightInputs.forEach(inp => {
            if (!inp.readOnly) {
                const updateHasValue = () => {
                    if (inp.value && inp.value.toString().trim() !== '') {
                        inp.classList.add('has-value');
                    } else {
                        inp.classList.remove('has-value');
                    }
                };

                updateHasValue();
                inp.addEventListener('input', updateHasValue);
                inp.addEventListener('change', updateHasValue);
                inp.addEventListener('blur', updateHasValue);

                // Focus state for unit-box
                const weightWrapper = inp.closest('.weight-wrapper');
                if (weightWrapper) {
                    inp.addEventListener('focus', () => {
                        weightWrapper.classList.add('is-focused');
                    });
                    inp.addEventListener('blur', () => {
                        weightWrapper.classList.remove('is-focused');
                    });
                }
            }
        });
    }

    /* ----------------------------------------------------
       RENDER TABLES
    ---------------------------------------------------- */

    function renderExpensesTable() {
        const totalItems = expensesData.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE_EXPENSES));

        if (currentExpensesPage > totalPages) currentExpensesPage = totalPages;

        const startIndex = (currentExpensesPage - 1) * PAGE_SIZE_EXPENSES;
        const endIndex   = Math.min(startIndex + PAGE_SIZE_EXPENSES, totalItems);

        expensesTbody.innerHTML = '';

        for (let i = startIndex; i < endIndex; i++) {
            const rowData = expensesData[i];
            const tr = document.createElement('tr');

            const dateCell = document.createElement('td');
            dateCell.textContent = formatDateToLabel(rowData.date);

            const farmCell = document.createElement('td');
            farmCell.textContent = rowData.farm;

            const pigCell = document.createElement('td');
            pigCell.textContent = rowData.pig;

            const categoryCell = document.createElement('td');
            categoryCell.textContent = rowData.category;

            const priceCell = document.createElement('td');
            priceCell.textContent = formatCurrency(rowData.price);

            // --- ACTION BUTTONS TD ---
            const actionCell = document.createElement('td');
            actionCell.classList.add('actions-cell');
            actionCell.innerHTML = `
                <button class="btn-edit" data-index="${i}"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-delete" data-index="${i}"><i class="fa-solid fa-trash"></i></button>
            `;

            tr.appendChild(dateCell);
            tr.appendChild(farmCell);
            tr.appendChild(pigCell);
            tr.appendChild(categoryCell);
            tr.appendChild(priceCell);
            tr.appendChild(actionCell);

            expensesTbody.appendChild(tr);

        }

        showingCountExpenses.textContent = totalItems === 0 ? 0 : (endIndex - startIndex);
        totalCountExpenses.textContent   = totalItems;
        pageExpensesLabel.textContent    = `Page ${currentExpensesPage}`;

        prevExpensesBtn.disabled = currentExpensesPage === 1 || totalItems === 0;
        nextExpensesBtn.disabled = currentExpensesPage === totalPages || totalItems === 0;
    }

    function renderSoldTable() {
        // Filter out cancelled records
        const activeSoldData = soldData.filter(record => !record.cancelled);
        const totalItems = activeSoldData.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE_SOLD));

        if (currentSoldPage > totalPages) currentSoldPage = totalPages;

        const startIndex = (currentSoldPage - 1) * PAGE_SIZE_SOLD;
        const endIndex   = Math.min(startIndex + PAGE_SIZE_SOLD, totalItems);

        soldTbody.innerHTML = '';

        for (let i = startIndex; i < endIndex; i++) {
            const rowData = activeSoldData[i];
            const tr = document.createElement('tr');

            const dateCell = document.createElement('td');
            dateCell.textContent = formatDateToLabel(rowData.dateSold);

            const farmCell = document.createElement('td');
            farmCell.textContent = rowData.farm;

            const pigCell = document.createElement('td');
            pigCell.textContent = rowData.pig;

            const weightCell = document.createElement('td');
            weightCell.textContent = rowData.weight;

            const priceKgCell = document.createElement('td');
            priceKgCell.textContent = 'P' + (rowData.pricePerKg || 0);

            const priceCell = document.createElement('td');
            priceCell.textContent = formatCurrency(rowData.totalPrice);

            // --- ACTION BUTTONS TD ---
            // Find the actual index in the soldData array
            const actualIndex = soldData.findIndex(record => record === rowData);
            const actionCell = document.createElement('td');
            actionCell.classList.add('actions-cell');
                actionCell.innerHTML = `
                    <button class="btn-edit-sold" data-index="${actualIndex}"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-cancel-sold" data-index="${actualIndex}"><i class="fa-solid fa-ban"></i></button>
                `;

            tr.appendChild(dateCell);
            tr.appendChild(farmCell);
            tr.appendChild(pigCell);
            tr.appendChild(weightCell);
            tr.appendChild(priceKgCell);
            tr.appendChild(priceCell);
            tr.appendChild(actionCell);

            soldTbody.appendChild(tr);


        }

        showingCountSold.textContent = totalItems === 0 ? 0 : (endIndex - startIndex);
        totalCountSold.textContent   = totalItems;
        pageSoldLabel.textContent    = `Page ${currentSoldPage}`;

        prevSoldBtn.disabled = currentSoldPage === 1 || totalItems === 0;
        nextSoldBtn.disabled = currentSoldPage === totalPages || totalItems === 0;
    }

    // HANDLE EDIT / DELETE FOR EXPENSES
document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-edit")) {
        const index = e.target.closest(".btn-edit").dataset.index;
        editExpense(index);
    }
    if (e.target.closest(".btn-delete")) {
        const index = e.target.closest(".btn-delete").dataset.index;
        deleteExpense(index);
    }
});

function editExpense(index) {
    const item = expensesData[index];

    // Fill modal
    dateInput.value = item.date;
    farmSelect.value = item.farm;
    pigSelect.value  = item.pig;
    categorySelect.value = item.category;
    priceInput.value = item.price;

    // Trigger floating labels
    dateWrapper.classList.add('has-value');
    toggleHasValue(farmSelect);
    toggleHasValue(pigSelect);
    toggleHasValue(categorySelect);
    toggleHasValue(priceInput);

    // Set editing state
    isEditing = true;
    editingIndex = index;

    // Open modal and tell it this is NOT a new entry
    openModal(false);
}



function deleteExpense(index) {
    Swal.fire({
        icon: 'warning',
        title: 'Delete this expense?',
        showCancelButton: true,
        confirmButtonText: 'Delete'
    }).then(res => {
        if (res.isConfirmed) {
            expensesData.splice(index, 1);
            renderExpensesTable();
        }
    });
}


// SOLD EDIT / DELETE
function editSold(index) {
    const item = soldData[index];
    const editSoldModal = document.getElementById('editSoldModal');
    
    if (!editSoldModal) return;

    // Store the editing index
    editSoldModal.dataset.editingIndex = index;

    // Populate the modal with current data
    const editDateSold = document.getElementById('editDateSold');
    const editFarmName = document.getElementById('editFarmName');
    const editPigName = document.getElementById('editPigName');
    const editWeightSold = document.getElementById('editWeightSold');
    const editPricePerKg = document.getElementById('editPricePerKg');
    const editTotalPrice = document.getElementById('editTotalPrice');

    if (editDateSold) editDateSold.value = item.dateSold;
    if (editFarmName) editFarmName.value = item.farm;
    if (editPigName) editPigName.value = item.pig;
    if (editWeightSold) editWeightSold.value = item.weight.replace('kg', '').trim();
    if (editPricePerKg) editPricePerKg.value = item.pricePerKg;
    if (editTotalPrice) editTotalPrice.value = formatCurrency(item.totalPrice);

    // Update floating labels
    if (editDateSold) toggleHasValue(editDateSold);
    if (editWeightSold) toggleHasValue(editWeightSold);
    if (editPricePerKg) toggleHasValue(editPricePerKg);

    // Show the modal
    editSoldModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function deleteSold(index) {
    Swal.fire({
        icon: 'warning',
        title: 'Cancel this record? This pig will be mark back as To Sale.',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then(res => {
        if (res.isConfirmed) {
            soldData[index].cancelled = true;
            renderSoldTable();
            // Show success alert with an Undo option
            Swal.fire({
                icon: 'success',
                title: 'Record cancelled',
                showCancelButton: true,
                confirmButtonText: 'Undo',
                cancelButtonText: 'Close'
            }).then(choice => {
                if (choice.isConfirmed) {
                    // User clicked Undo — restore the sold record
                    soldData[index].cancelled = false;
                    renderSoldTable();
                    Swal.fire({
                        icon: 'success',
                        title: 'Record restored',
                        showConfirmButton: false,
                        timer: 1200
                    });
                }
            });
        }
    });
}


// HANDLE EDIT / DELETE FOR SOLD DATA
document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-edit-sold")) {
        const index = e.target.closest(".btn-edit-sold").dataset.index;
        editSold(index);
    }
    if (e.target.closest(".btn-cancel-sold")) {
        const index = e.target.closest(".btn-cancel-sold").dataset.index;
        cancelSold(index);
    }
    if (e.target.closest(".btn-delete-sold")) {
        const index = e.target.closest(".btn-delete-sold").dataset.index;
        deleteSold(index);
    }
});

function cancelSold(index) {
    Swal.fire({
        icon: 'warning',
        title: 'Cancel this record?',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then(res => {
        if (res.isConfirmed) {
            soldData[index].cancelled = true;
            renderSoldTable();
            // Show success alert with an Undo option
            Swal.fire({
                icon: 'success',
                title: 'Record cancelled',
                showCancelButton: true,
                confirmButtonText: 'Undo',
                cancelButtonText: 'Close'
            }).then(choice => {
                if (choice.isConfirmed) {
                    // User clicked Undo — restore the sold record
                    soldData[index].cancelled = false;
                    renderSoldTable();
                    Swal.fire({
                        icon: 'success',
                        title: 'Record restored',
                        showConfirmButton: false,
                        timer: 1200
                    });
                }
            });
        }
    });
}

    /* ----------------------------------------------------
       EDIT SOLD MODAL - OPEN / CLOSE / SAVE
    ---------------------------------------------------- */
    const editSoldModal = document.getElementById('editSoldModal');
    const closeEditSoldModalBtn = document.getElementById('closeEditSoldModal');
    const cancelEditSoldBtn = document.getElementById('cancelEditSold');
    const saveEditSoldBtn = document.getElementById('saveEditSold');

    const editDateSold = document.getElementById('editDateSold');
    const editWeightSold = document.getElementById('editWeightSold');
    const editPricePerKg = document.getElementById('editPricePerKg');
    const editTotalPrice = document.getElementById('editTotalPrice');

    // Close modal button
    if (closeEditSoldModalBtn) {
        closeEditSoldModalBtn.addEventListener('click', () => {
            editSoldModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    // Cancel button
    if (cancelEditSoldBtn) {
        cancelEditSoldBtn.addEventListener('click', () => {
            editSoldModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    // Close when clicking outside the dialog
    if (editSoldModal) {
        editSoldModal.addEventListener('click', (e) => {
            if (e.target === editSoldModal) {
                editSoldModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    // Auto-calculate total price when weight or price changes
    if (editWeightSold && editPricePerKg && editTotalPrice) {
        const calculateTotalPrice = () => {
            const weight = parseFloat(editWeightSold.value) || 0;
            const pricePerKg = parseFloat(editPricePerKg.value) || 0;
            const total = weight * pricePerKg;
            editTotalPrice.value = formatCurrency(total);
        };

        editWeightSold.addEventListener('input', calculateTotalPrice);
        editPricePerKg.addEventListener('input', calculateTotalPrice);
    }

    // Save changes button
    if (saveEditSoldBtn) {
        saveEditSoldBtn.addEventListener('click', () => {
            const editingIndex = editSoldModal.dataset.editingIndex;
            
            if (editingIndex === undefined) return;

            const dateSoldVal = editDateSold ? editDateSold.value : '';
            const weightVal = editWeightSold ? editWeightSold.value : '';
            const pricePerKgVal = editPricePerKg ? editPricePerKg.value : '';

            // Validate required fields
            if (!dateSoldVal) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Date is required',
                    showConfirmButton: true
                });
                return;
            }

            if (!weightVal) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Weight is required',
                    showConfirmButton: true
                });
                return;
            }

            if (!pricePerKgVal) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Price per kg is required',
                    showConfirmButton: true
                });
                return;
            }

            // Update the data
            const idx = parseInt(editingIndex);
            soldData[idx].dateSold = dateSoldVal;
            soldData[idx].weight = weightVal + 'kg';
            soldData[idx].pricePerKg = parseFloat(pricePerKgVal);
            soldData[idx].totalPrice = parseFloat(weightVal) * parseFloat(pricePerKgVal);

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Sold record updated',
                showConfirmButton: false,
                timer: 1500
            });

            // Refresh table
            renderSoldTable();

            // Close modal
            editSoldModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    /* ----------------------------------------------------
       PAGINATION BUTTON EVENTS
    ---------------------------------------------------- */

    prevExpensesBtn.addEventListener('click', () => {
        if (currentExpensesPage > 1) {
            currentExpensesPage--;
            renderExpensesTable();
        }
    });

    nextExpensesBtn.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(expensesData.length / PAGE_SIZE_EXPENSES));
        if (currentExpensesPage < totalPages) {
            currentExpensesPage++;
            renderExpensesTable();
        }
    });

    prevSoldBtn.addEventListener('click', () => {
        if (currentSoldPage > 1) {
            currentSoldPage--;
            renderSoldTable();
        }
    });

    nextSoldBtn.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(soldData.length / PAGE_SIZE_SOLD));
        if (currentSoldPage < totalPages) {
            currentSoldPage++;
            renderSoldTable();
        }
    });

    /* ----------------------------------------------------
       MODAL OPEN / CLOSE
    ---------------------------------------------------- */

function openModal(isNew = true) {
    if (!addRemModal) return;

    addRemModal.classList.add('show');
    document.body.style.overflow = 'hidden';

    if (isNew) {
        // Reset editing state
        isEditing = false;
        editingIndex = null;

        // Clear inputs for new expense
        if (dateInput) dateInput.value = '';
        if (farmSelect) farmSelect.value = '';
        if (pigSelect) pigSelect.value = '';
        if (categorySelect) categorySelect.value = '';
        if (priceInput) priceInput.value = '';

        // Update floating labels
        updateDateWrapperState();
        toggleHasValue(farmSelect);
        toggleHasValue(pigSelect);
        toggleHasValue(categorySelect);
        toggleHasValue(priceInput);
    }
}




    function closeModal() {
        if (!addRemModal) return;
        addRemModal.classList.remove('show');
        document.body.style.overflow = '';
    }

if (addPigBtn) {
    addPigBtn.addEventListener('click', () => openModal(true));
}
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    if (addRemModal) {
        addRemModal.addEventListener('click', (e) => {
            if (e.target === addRemModal) {
                closeModal();
            }
        });
    }

    /* ----------------------------------------------------
       CLEAR + SAVE BUTTON (FORM)
    ---------------------------------------------------- */

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (dateInput)  { dateInput.value = ''; updateDateWrapperState(); }
            if (farmSelect) { farmSelect.value = ''; toggleHasValue(farmSelect); }
            if (pigSelect)  { pigSelect.value = ''; toggleHasValue(pigSelect); }
            if (categorySelect) { categorySelect.value = ''; toggleHasValue(categorySelect); }
            if (priceInput) { priceInput.value = ''; toggleHasValue(priceInput); }
        });
    }

if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        const priceVal    = priceInput ? priceInput.value : '';
        const categoryVal = categorySelect ? categorySelect.value : '';

        const priceError    = document.getElementById('priceError');
        const categoryError = document.getElementById('categoryError');

        // reset errors
        priceError.style.display = 'none';
        categoryError.style.display = 'none';

        let hasError = false;

        if (!priceVal) {
            priceError.textContent = 'Price is required';
            priceError.style.display = 'block';
            hasError = true;
        }

        if (!categoryVal) {
            categoryError.textContent = 'Category is required';
            categoryError.style.display = 'block';
            hasError = true;
        }

        if (hasError) return;

        // ----------------------------
        // Save or Update
        // ----------------------------
        if (isEditing && editingIndex !== null) {
            // Update existing
            expensesData[editingIndex] = {
                date: dateInput.value,
                farm: farmSelect.value,
                pig: pigSelect.value,
                category: categoryVal,
                price: Number(priceVal)
            };
            Swal.fire({
                icon: 'success',
                title: 'Expense updated',
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            // Add new
            expensesData.push({
                date: dateInput.value,
                farm: farmSelect.value,
                pig: pigSelect.value,
                category: categoryVal,
                price: Number(priceVal)
            });
            Swal.fire({
                icon: 'success',
                title: 'Expense added',
                showConfirmButton: false,
                timer: 1500
            });
        }

        // Refresh table
        currentExpensesPage = Math.ceil(expensesData.length / PAGE_SIZE_EXPENSES);
        renderExpensesTable();

        // Reset modal
        if (clearBtn) clearBtn.click();
        closeModal();

        // Reset editing state
        isEditing = false;
        editingIndex = null;
    });
}



    /* ----------------------------------------------------
       FILTER DROPDOWN SCRIPT
    ---------------------------------------------------- */
    const filterToggle   = document.getElementById('filterToggle');
    const filterDropdown = document.getElementById('filterDropdown');
    const filterLabel    = document.querySelector('.filter-label');

    if (filterToggle && filterDropdown && filterLabel) {
        const filterSelects = filterDropdown.querySelectorAll('.form-select');

        // toggle dropdown
        filterToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
        });

        // close when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterDropdown.contains(e.target) && !filterToggle.contains(e.target)) {
                filterDropdown.classList.remove('show');
            }
        });

        // update button label
        filterSelects.forEach(select => {
            select.addEventListener('change', updateFilterLabel);
        });

        function updateFilterLabel() {
            let values = [];
            filterSelects.forEach(select => {
                const val = select.value.trim();
                if (val !== "") values.push(val);
            });

            filterLabel.textContent = values.length === 0 ? 'Filter' : values.join(' • ');
        }
    }

    /* ----------------------------------------------------
       INITIAL RENDER
    ---------------------------------------------------- */
    renderExpensesTable();
    renderSoldTable();
});

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

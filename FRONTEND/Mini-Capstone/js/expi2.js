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

    async function fetchExpenseIncome(){
        const userId = localStorage.getItem('userID');
        //console.log('userId:', userId)
        try{
            const res = await fetch('http://localhost:8080/api/expenses-records/Expenses-Income', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({userId})
            });

            const result = await res.json();
            const EIData = result.EIData; // EI means Expenses and Incomes

            const incomeData = Array(12).fill(0);
            const expenseData = Array(12).fill(0);

            EIData.forEach(d => {
                const monthIndex = d.month - 1;
                incomeData[monthIndex] = d.income || 0;
                expenseData[monthIndex] = d.expenses || 0;
            })
        
        const data ={
            labels: [
                'Jan','Feb','Mar','Apr',
                'May','Jun','Jul','Aug',
                'Sep','Oct','Nov','Dec'
            ],
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#5dd05d',
                    hoverBackgroundColor: '#7dde7d',
                    barPercentage: 0.65,
                    categoryPercentage: 0.8,
                    borderRadius: 4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
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
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
        
    } 
    fetchExpenseIncome();

        // END OF THE BARCHART




    /* ----------------------------------------------------
       SIMPLE DATA SOURCES
       (Replace with DB or backend data later)
    ---------------------------------------------------- */

    let expensesData = [];
    let soldData = [];

    //list for all expenses
    async function fetchExpensesTable(){
        
        const userId = localStorage.getItem('userID');
        
        try{
            const res = await fetch('http://localhost:8080/api/expenses-records/Expenses-Table',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId})
            });

            const result = await res.json();
            expensesData = result.ExpenseTable || 0;
            renderExpensesTable();

        } catch (error) {
            console.error('Error fetching table data:', error);
        }
    }
    
    // list for all pig solds
     async function fetchSoldTable(){

        const userId = localStorage.getItem('userID');      
        
        try{
            const res = await fetch('http://localhost:8080/api/expenses-records/PigSold-Table', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId})
            });
            
            const result = await res.json();
            soldData = result.SoldTable || 0;
            renderSoldTable();

        } catch (error) {
            console.error('Error fetching table data: ', error)
        }
     }
    fetchExpensesTable();
    fetchSoldTable();


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
        const totalItems = soldData.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE_SOLD));

        if (currentSoldPage > totalPages) currentSoldPage = totalPages;

        const startIndex = (currentSoldPage - 1) * PAGE_SIZE_SOLD;
        const endIndex   = Math.min(startIndex + PAGE_SIZE_SOLD, totalItems);

        soldTbody.innerHTML = '';

        for (let i = startIndex; i < endIndex; i++) {
            const rowData = soldData[i];
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
            const actionCell = document.createElement('td');
            actionCell.classList.add('actions-cell');
            actionCell.innerHTML = `
                <button class="btn-edit-sold" data-index="${i}"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-delete-sold" data-index="${i}"><i class="fa-solid fa-trash"></i></button>
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
    Swal.fire("Edit sold item clicked for: " + item.pig);
}

function deleteSold(index) {
    Swal.fire({
        icon: 'warning',
        title: 'Delete this record?',
        showCancelButton: true,
        confirmButtonText: 'Delete'
    }).then(res => {
        if (res.isConfirmed) {
            soldData.splice(index, 1);
            renderSoldTable();
        }
    });
}


// HANDLE EDIT / DELETE FOR SOLD DATA
document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-edit-sold")) {
        const index = e.target.closest(".btn-edit-sold").dataset.index;
        editSold(index);
    }
    if (e.target.closest(".btn-delete-sold")) {
        const index = e.target.closest(".btn-delete-sold").dataset.index;
        deleteSold(index);
    }
});


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

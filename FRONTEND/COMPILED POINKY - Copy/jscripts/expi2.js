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
        { dateSold: '2025-09-19', farm: 'Farm 001', pig: 'Pig 003', weight: '82kg', pricePerKg: 260, totalPrice: 21320 },
        { dateSold: '2025-09-10', farm: 'Farm 002', pig: 'Pig 005', weight: '75kg', pricePerKg: 250, totalPrice: 18750 }
    ];

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

            tr.appendChild(dateCell);
            tr.appendChild(farmCell);
            tr.appendChild(pigCell);
            tr.appendChild(categoryCell);
            tr.appendChild(priceCell);

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

            tr.appendChild(dateCell);
            tr.appendChild(farmCell);
            tr.appendChild(pigCell);
            tr.appendChild(weightCell);
            tr.appendChild(priceKgCell);
            tr.appendChild(priceCell);

            soldTbody.appendChild(tr);
        }

        showingCountSold.textContent = totalItems === 0 ? 0 : (endIndex - startIndex);
        totalCountSold.textContent   = totalItems;
        pageSoldLabel.textContent    = `Page ${currentSoldPage}`;

        prevSoldBtn.disabled = currentSoldPage === 1 || totalItems === 0;
        nextSoldBtn.disabled = currentSoldPage === totalPages || totalItems === 0;
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

    function openModal() {
        if (!addRemModal) return;
        addRemModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!addRemModal) return;
        addRemModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    if (addPigBtn)  addPigBtn.addEventListener('click', openModal);
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
            const dateVal      = dateInput ? dateInput.value : '';
            const farmVal      = farmSelect ? farmSelect.value : '';
            const pigVal       = pigSelect ? pigSelect.value : '';
            const categoryVal  = categorySelect ? categorySelect.value : '';
            const priceVal     = priceInput ? priceInput.value : '';

            if (!dateVal || !farmVal || !pigVal || !categoryVal || !priceVal) {
                if (window.Swal) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Missing information',
                        text: 'Please fill out all fields before saving.'
                    });
                } else {
                    alert('Please fill out all fields before saving.');
                }
                return;
            }

            expensesData.push({
                date: dateVal,
                farm: farmVal,
                pig: pigVal,
                category: categoryVal,
                price: Number(priceVal)
            });

            currentExpensesPage = Math.ceil(expensesData.length / PAGE_SIZE_EXPENSES);

            renderExpensesTable();

            if (clearBtn) clearBtn.click();
            closeModal();

            if (window.Swal) {
                Swal.fire({
                    icon: 'success',
                    title: 'Expense added',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
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

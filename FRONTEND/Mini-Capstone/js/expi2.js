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

    // selects inside modal (farm, pig, category) - now using IDs
    const farmSelect     = document.getElementById('farmSelect');
    const pigSelect      = document.getElementById('pigSelect');
    const categorySelect = document.getElementById('categorySelect');

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
       SUMMARY AND BREAKDOWN CALCULATION
        (for display only!!)
    ---------------------------------------------------- */

    async function fetchExpensesandReports() {
        const userId = localStorage.getItem('userID');

        const bodyData = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userId})
        }

        try {
            const [
                TotalExp, EstInc, ProjProf, 
                FeedExp, MedExp, TransExp, 
                PigletExp, LaborExp, UtilExp] = await Promise.all([
                    
                    // FOR SUMMARY DATA
                    fetch('http://localhost:8080/api/expenses-records/Total-Expenses', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Estimated-Income', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Projected-Profit', bodyData),

                    // FOR BREAKDOWN DATA
                    fetch('http://localhost:8080/api/expenses-records/Feed-Expenses', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Medicine-Expenses', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Transportation-Expenses', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Piglets-Expenses', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Labor-Expenses', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Utilities-Expenses', bodyData)
            ]);

            // Parse JSON responses FOR SUMMARY AND BREAKDOWN
            const totalExpensesData     = await TotalExp.json();
            const estimatedIncomeData   = await EstInc.json();
            const projectedProfitData   = await ProjProf.json();

            const feedExpensesData              = await FeedExp.json();
            const medicineExpensesData          = await MedExp.json();
            const transportationExpensesData    = await TransExp.json();
            const pigletsExpensesData           = await PigletExp.json();
            const laborExpensesData             = await LaborExp.json();
            const utilitiesExpensesData         = await UtilExp.json();

            // DISPLAYING IT TO THE FRONTEND
            document.getElementById('totalExpenses').textContent    = '₱' + (totalExpensesData.TotalExpense[0].TotalExpense || 0).toLocaleString('en-PH');
            document.getElementById('estimatedIncome').textContent  = '₱' + (estimatedIncomeData.EstimatedIncome[0].EstimatedIncome || 0).toLocaleString('en-PH');
            document.getElementById('projectedProfit').textContent  = '₱' + (projectedProfitData.ProjectedProfit[0].ProjectedProfit || 0).toLocaleString('en-PH');

            console.log('Total Expenses Data:', totalExpensesData);
            console.log('Estimated Income Data:', estimatedIncomeData);
            console.log('Projected Profit Data:', projectedProfitData);
            console.log('Feed Expenses Data:', feedExpensesData);
            console.log('Medicine Expenses Data:', medicineExpensesData);
            console.log('Transportation Expenses Data:', transportationExpensesData);
            console.log('Piglets Expenses Data:', pigletsExpensesData);
            console.log('Labor Expenses Data:', laborExpensesData);
            console.log('Utilities Expenses Data:', utilitiesExpensesData);

            document.getElementById('feedExpenses').textContent           = '₱' + (feedExpensesData.FeedExpenses[0]?.TotalFeedExpenses || 0).toLocaleString('en-PH');
            document.getElementById('medicineExpenses').textContent       = '₱' + (medicineExpensesData.MedicineExpenses[0]?.TotalMedicineExpenses || 0).toLocaleString('en-PH');
            document.getElementById('transportationExpenses').textContent = '₱' + (transportationExpensesData.TransportationExpenses[0]?.TotalTransportationExpenses || 0).toLocaleString('en-PH');
            document.getElementById('pigletsExpenses').textContent        = '₱' + (pigletsExpensesData.PigletsExpenses[0]?.TotalPigletsExpenses || 0).toLocaleString('en-PH');
            document.getElementById('laborExpenses').textContent          = '₱' + (laborExpensesData.LaborExpenses[0]?.TotalLaborExpenses || 0).toLocaleString('en-PH');
            document.getElementById('utilitiesExpenses').textContent      = '₱' + (utilitiesExpensesData.UtilitiesExpenses[0]?.TotalUtilitiesExpenses || 0).toLocaleString('en-PH');
            


        } catch (error) {
            console.error('Error fetching summary and breakdown data:', error);
        }

    }
    fetchExpensesandReports();

    // FETCH FILTERED SUMMARY, BREAKDOWN, AND CHART DATA
    async function fetchFilteredData(filters) {
        const userId = localStorage.getItem('userID');

        const bodyData = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId, filters })
        }

        try {
            const [
                TotalExp, EstInc, ProjProf, 
                FeedExp, MedExp, TransExp, 
                PigletExp, LaborExp, UtilExp,
                ChartData] = await Promise.all([
                    
                    // FOR SUMMARY DATA
                    fetch('http://localhost:8080/api/expenses-records/Total-Expenses-Filtered', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Estimated-Income-Filtered', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Projected-Profit-Filtered', bodyData),

                    // FOR BREAKDOWN DATA
                    fetch('http://localhost:8080/api/expenses-records/Feed-Expenses-Filtered', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Medicine-Expenses-Filtered', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Transportation-Expenses-Filtered', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Piglets-Expenses-Filtered', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Labor-Expenses-Filtered', bodyData),
                    fetch('http://localhost:8080/api/expenses-records/Utilities-Expenses-Filtered', bodyData),
                    
                    // FOR CHART DATA
                    fetch('http://localhost:8080/api/expenses-records/Expenses-Income-Filtered', bodyData)
            ]);

            // Parse JSON responses
            const totalExpensesData     = await TotalExp.json();
            const estimatedIncomeData   = await EstInc.json();
            const projectedProfitData   = await ProjProf.json();

            const feedExpensesData              = await FeedExp.json();
            const medicineExpensesData          = await MedExp.json();
            const transportationExpensesData    = await TransExp.json();
            const pigletsExpensesData           = await PigletExp.json();
            const laborExpensesData             = await LaborExp.json();
            const utilitiesExpensesData         = await UtilExp.json();
            
            const chartDataResult = await ChartData.json();

            // UPDATE SUMMARY SECTION
            document.getElementById('totalExpenses').textContent    = '₱' + (totalExpensesData.TotalExpense[0].TotalExpense || 0).toLocaleString('en-PH');
            document.getElementById('estimatedIncome').textContent  = '₱' + (estimatedIncomeData.EstimatedIncome[0].EstimatedIncome || 0).toLocaleString('en-PH');
            document.getElementById('projectedProfit').textContent  = '₱' + (projectedProfitData.ProjectedProfit[0].ProjectedProfit || 0).toLocaleString('en-PH');

            // UPDATE BREAKDOWN SECTION
            document.getElementById('feedExpenses').textContent           = '₱' + (feedExpensesData.FeedExpenses[0]?.TotalFeedExpenses || 0).toLocaleString('en-PH');
            document.getElementById('medicineExpenses').textContent       = '₱' + (medicineExpensesData.MedicineExpenses[0]?.TotalMedicineExpenses || 0).toLocaleString('en-PH');
            document.getElementById('transportationExpenses').textContent = '₱' + (transportationExpensesData.TransportationExpenses[0]?.TotalTransportationExpenses || 0).toLocaleString('en-PH');
            document.getElementById('pigletsExpenses').textContent        = '₱' + (pigletsExpensesData.PigletsExpenses[0]?.TotalPigletsExpenses || 0).toLocaleString('en-PH');
            document.getElementById('laborExpenses').textContent          = '₱' + (laborExpensesData.LaborExpenses[0]?.TotalLaborExpenses || 0).toLocaleString('en-PH');
            document.getElementById('utilitiesExpenses').textContent      = '₱' + (utilitiesExpensesData.UtilitiesExpenses[0]?.TotalUtilitiesExpenses || 0).toLocaleString('en-PH');

            // UPDATE CHART
            updateExpenseChart(chartDataResult.EIData);

        } catch (error) {
            console.error('Error fetching filtered data:', error);
        }
    }

   /* ----------------------------------------------------
       Chart for income and expenses
    ---------------------------------------------------- */

    // LOAD DROPDOWNS FROM API
    async function loadDropdownsFromAPI() {
        const userId = localStorage.getItem('userID');

        try {
            // Fetch farms
            const farmsRes = await fetch('http://localhost:8080/api/expenses-records/dropdown-farms', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userId })
            });
            const farmsData = await farmsRes.json();

            // Determine currently selected farm (may be empty on initial load)
            const farmId = farmSelect ? (farmSelect.value || null) : null;

            // Fetch pigs (optionally filtered by farm)
            const pigsRes = await fetch('http://localhost:8080/api/expenses-records/dropdown-pigs', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userId, farmId })
            });
            const pigsData = await pigsRes.json();

            // Fetch categories
            const categoriesRes = await fetch('http://localhost:8080/api/expenses-records/dropdown-categories', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({})
            });
            const categoriesData = await categoriesRes.json();

            // Populate farm dropdown
            if (farmSelect && farmsData.farms) {
                farmSelect.innerHTML = '';
                farmsData.farms.forEach(farm => {
                    const option = document.createElement('option');
                    option.value = farm.FarmID;
                    option.textContent = farm.FarmName;
                    farmSelect.appendChild(option);
                });
            }

            // Populate pig dropdown
            if (pigSelect && pigsData.pigs) {
                pigSelect.innerHTML = '';
                pigsData.pigs.forEach(pig => {
                    const option = document.createElement('option');
                    option.value = pig.PigID;
                    option.textContent = `${pig.PigName} (${pig.FarmName})`;
                    pigSelect.appendChild(option);
                });
            }

            // When user changes farm in the modal, re-fetch pigs filtered by that farm
            if (farmSelect && !farmSelect.dataset.modalListenerAttached) {
                farmSelect.dataset.modalListenerAttached = '1';
                farmSelect.addEventListener('change', async function onModalFarmChange() {
                try {
                    const selectedFarmId = farmSelect.value || null;
                    const resp = await fetch('http://localhost:8080/api/expenses-records/dropdown-pigs', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ userId, farmId: selectedFarmId })
                    });
                    const data = await resp.json();
                    if (data.success && pigSelect) {
                        pigSelect.innerHTML = '';
                        data.pigs.forEach(pig => {
                            const option = document.createElement('option');
                            option.value = pig.PigID;
                            option.textContent = `${pig.PigName} (${pig.FarmName})`;
                            pigSelect.appendChild(option);
                        });
                    }
                } catch (err) {
                    console.error('Failed to re-fetch pigs for selected farm (modal):', err);
                }
                });
            }

            // Populate category dropdown
            if (categorySelect && categoriesData.categories) {
                categoriesData.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            }

            console.log('Dropdowns loaded successfully');
            console.log('Farms:', farmsData.farms);
            console.log('Pigs:', pigsData.pigs);
            console.log('Categories:', categoriesData.categories);

        } catch (error) {
            console.error('Error loading dropdowns:', error);
        }
    }

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
            updateExpenseChart(EIData);

        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
        
    } 
    
    // GLOBAL CHART INSTANCE
    let incomeExpensesChart = null;

    // UPDATE EXPENSE CHART FUNCTION
    function updateExpenseChart(EIData) {
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
        
        // Destroy existing chart if it exists
        if (incomeExpensesChart) {
            incomeExpensesChart.destroy();
        }
        
        // Create the Income & Expenses Bar Chart
        incomeExpensesChart = new Chart(ctx, {
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
    }
    
    fetchExpenseIncome();

        // END OF THE BARCHART

    /* ----------------------------------------------------
       TABLE FOR EXPENSE LIST AND PIG SOLD
    ---------------------------------------------------- */

    let expensesData = [];
    let soldData = [];

    // Filter state for expenses
    let expensesFilterState = {
        farm: '',
        pig: '',
        month: '',
        year: ''
    };

    // Filter state for sold data
    let soldFilterState = {
        farm: '',
        pig: '',
        month: '',
        year: ''
    };

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
            expensesData = result.ExpenseTable || [];
           
            renderExpensesTable();
            populateFilterDropdowns();

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
            soldData = result.SoldTable || [];
            renderSoldTable();
            populateFilterDropdowns();

        } catch (error) {
            console.error('Error fetching table data: ', error)
        }
     }
    fetchExpensesTable();
    fetchSoldTable();

    /* ----------------------------------------------------
       FILTER FUNCTIONS FOR EXPENSES TABLE
    ---------------------------------------------------- */

    /**
     * Filter expenses data based on criteria
     * @param {Array} data - The expenses data to filter
     * @param {Object} filters - Filter criteria {farm, pig, month, year}
     * @returns {Array} - Filtered data
     */
    function filterExpensesData(data, filters) {
        return data.filter(item => {
            // Check farm filter
            if (filters.farm && item.FarmName !== filters.farm) {
                return false;
            }

            // Check pig filter
            if (filters.pig && item.PigName !== filters.pig) {
                return false;
            }

            // Check month and year filters
            if ((filters.month || filters.year) && item.ExpenseDate) {
                const date = new Date(item.ExpenseDate);
                const itemMonth = (date.getMonth() + 1).toString();
                const itemYear = date.getFullYear().toString();

                if (filters.month && itemMonth !== filters.month) {
                    return false;
                }

                if (filters.year && itemYear !== filters.year) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Filter sold data based on criteria
     * @param {Array} data - The sold data to filter
     * @param {Object} filters - Filter criteria {farm, pig, month, year}
     * @returns {Array} - Filtered data
     */
    function filterSoldData(data, filters) {
        return data.filter(item => {
            // Check farm filter
            if (filters.farm && item.FarmName !== filters.farm) {
                return false;
            }

            // Check pig filter
            if (filters.pig && item.PigName !== filters.pig) {
                return false;
            }

            // Check month and year filters
            if ((filters.month || filters.year) && item.DateSold) {
                const date = new Date(item.DateSold);
                const itemMonth = (date.getMonth() + 1).toString();
                const itemYear = date.getFullYear().toString();

                if (filters.month && itemMonth !== filters.month) {
                    return false;
                }

                if (filters.year && itemYear !== filters.year) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Get unique values from data for filter dropdowns
     * @param {Array} data - The data to extract values from
     * @param {String} fieldName - The field name to extract
     * @returns {Array} - Unique values sorted
     */
    function getUniqueFilterValues(data, fieldName) {
        const values = [...new Set(data.map(item => item[fieldName]).filter(v => v))];
        return values.sort();
    }

    /**
     * Populate filter dropdowns with data from API
     */
    async function populateFilterDropdowns() {
        const filterDropdown = document.getElementById('filterDropdown');
        if (!filterDropdown) return;

        const selects = filterDropdown.querySelectorAll('.form-select');
        if (selects.length < 4) return;

        const [farmSelect, pigSelect, monthSelect, yearSelect] = selects;
        const userId = localStorage.getItem('userID');

        try {
            // Fetch farms from API
            const farmsRes = await fetch('http://localhost:8080/api/expenses-records/dropdown-farms', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId})
            });
            const farmsData = await farmsRes.json();
            
            // Populate farm filter (use FarmID as option value so filtering works)
            const currentFarmValue = farmSelect.value;
            farmSelect.innerHTML = '<option value="">Farm</option>';
            if (farmsData.success && farmsData.farms) {
                farmsData.farms.forEach(farm => {
                    const option = document.createElement('option');
                    // For the filter dropdown we need the option.value to match data shown in the table
                    // (table uses FarmName). Store the FarmID in a data attribute for API calls.
                    option.value = farm.FarmName;
                    option.dataset.farmid = farm.FarmID;
                    option.textContent = farm.FarmName;
                    farmSelect.appendChild(option);
                });
            }
            farmSelect.value = currentFarmValue;

            // Fetch pigs from API, sending currently selected farmId (or null)
            // Determine farmId to send to backend from the selected option's data attribute
            const selectedOption = farmSelect.selectedOptions && farmSelect.selectedOptions[0];
            const selectedFilterFarmId = selectedOption ? (selectedOption.dataset.farmid || null) : null;
            const pigsRes = await fetch('http://localhost:8080/api/expenses-records/dropdown-pigs', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userId, farmId: selectedFilterFarmId })
            });
            const pigsData = await pigsRes.json();

            // Populate pig filter
            const currentPigValue = pigSelect.value;
            pigSelect.innerHTML = '<option value="">Pig Name/ID</option>';
            if (pigsData.success && pigsData.pigs) {
                pigsData.pigs.forEach(pig => {
                    const option = document.createElement('option');
                    option.value = pig.PigName;
                    option.textContent = pig.PigName;
                    pigSelect.appendChild(option);
                });
            }
            pigSelect.value = currentPigValue;

            // When user changes farm in the filter dropdown, re-fetch pigs for that filter
            if (farmSelect && !farmSelect.dataset.filterListenerAttached) {
                farmSelect.dataset.filterListenerAttached = '1';
                farmSelect.addEventListener('change', async function onFilterFarmChange() {
                try {
                    // Read the FarmID from the selected option's dataset when re-fetching pigs
                    const selOpt = farmSelect.selectedOptions && farmSelect.selectedOptions[0];
                    const selFarm = selOpt ? (selOpt.dataset.farmid || null) : null;
                    const r = await fetch('http://localhost:8080/api/expenses-records/dropdown-pigs', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ userId, farmId: selFarm })
                    });
                    const d = await r.json();
                    if (d.success && pigSelect) {
                        pigSelect.innerHTML = '<option value="">Pig Name/ID</option>';
                        d.pigs.forEach(pig => {
                            const option = document.createElement('option');
                            option.value = pig.PigName;
                            option.textContent = pig.PigName;
                            pigSelect.appendChild(option);
                        });
                    }
                } catch (err) {
                    console.error('Failed to re-fetch pigs for selected farm (filter):', err);
                }
                });
            }

            // Update month select to show month names instead of numbers
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            monthSelect.innerHTML = '<option value="">Month</option>';
            monthNames.forEach((month, index) => {
                const option = document.createElement('option');
                option.value = (index + 1).toString(); // Keep numeric value for filtering
                option.textContent = month; // Display full month name
                monthSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error populating filter dropdowns:', error);
        }
    }

    /**
     * Apply filters and re-render tables
     */
    function applyExpensesFilters() {
        const filterDropdown = document.getElementById('filterDropdown');
        if (!filterDropdown) return;

        const selects = filterDropdown.querySelectorAll('.form-select');
        if (selects.length < 4) return;

        const [farmSelect, pigSelect, monthSelect, yearSelect] = selects;

        expensesFilterState = {
            farm: farmSelect.value,
            pig: pigSelect.value,
            month: monthSelect.value,
            year: yearSelect.value
        };

        currentExpensesPage = 1; // Reset to first page
        renderExpensesTable();
        
        // Fetch and update filtered data for chart and summary
        fetchFilteredData(expensesFilterState);
    }

    /**
     * Apply filters and re-render sold table
     */
    function applySoldFilters() {
        const filterDropdown = document.getElementById('filterDropdown');
        if (!filterDropdown) return;

        const selects = filterDropdown.querySelectorAll('.form-select');
        if (selects.length < 4) return;

        const [farmSelect, pigSelect, monthSelect, yearSelect] = selects;

        soldFilterState = {
            farm: farmSelect.value,
            pig: pigSelect.value,
            month: monthSelect.value,
            year: yearSelect.value
        };

        currentSoldPage = 1; // Reset to first page
        renderSoldTable();
    }

    /**
     * Clear all filters
     */
    function clearAllFilters() {
        const filterDropdown = document.getElementById('filterDropdown');
        if (!filterDropdown) return;

        const selects = filterDropdown.querySelectorAll('.form-select');
        selects.forEach(select => {
            select.value = '';
        });

        expensesFilterState = { farm: '', pig: '', month: '', year: '' };
        soldFilterState = { farm: '', pig: '', month: '', year: '' };
        currentExpensesPage = 1;
        currentSoldPage = 1;

        renderExpensesTable();
        renderSoldTable();
    }


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
        // Apply filters to get filtered data
        const filteredData = filterExpensesData(expensesData, expensesFilterState);
        const totalItems = filteredData.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE_EXPENSES));

        if (currentExpensesPage > totalPages) currentExpensesPage = totalPages;

        const startIndex = (currentExpensesPage - 1) * PAGE_SIZE_EXPENSES;
        const endIndex   = Math.min(startIndex + PAGE_SIZE_EXPENSES, totalItems);

        expensesTbody.innerHTML = '';

        for (let i = startIndex; i < endIndex; i++) {
            const rowData = filteredData[i];
            const tr = document.createElement('tr');

            const dateCell = document.createElement('td');
            dateCell.textContent = formatDateToLabel(rowData.ExpenseDate);

            const farmCell = document.createElement('td');
            farmCell.textContent = rowData.FarmName;

            const pigCell = document.createElement('td');
            pigCell.textContent = rowData.PigName;

            const categoryCell = document.createElement('td');
            categoryCell.textContent = rowData.Category;

            const priceCell = document.createElement('td');
            priceCell.textContent = formatCurrency(rowData.Amount);

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
        // Filter out cancelled records and apply filters
        const activeSoldData = soldData.filter(record => !record.cancelled);
        const filteredData = filterSoldData(activeSoldData, soldFilterState);
        const totalItems = filteredData.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE_SOLD));

        if (currentSoldPage > totalPages) currentSoldPage = totalPages;

        const startIndex = (currentSoldPage - 1) * PAGE_SIZE_SOLD;
        const endIndex   = Math.min(startIndex + PAGE_SIZE_SOLD, totalItems);

        soldTbody.innerHTML = '';

        for (let i = startIndex; i < endIndex; i++) {
            const rowData = filteredData[i];
            const tr = document.createElement('tr');

            const dateCell = document.createElement('td');
            dateCell.textContent = formatDateToLabel(rowData.DateSold);

            const farmCell = document.createElement('td');
            farmCell.textContent = rowData.FarmName;

            const pigCell = document.createElement('td');
            pigCell.textContent = rowData.PigName;

            const weightCell = document.createElement('td');
            weightCell.textContent = rowData.Weight;

            const priceKgCell = document.createElement('td');
            priceKgCell.textContent = 'P' + (rowData.PricePerKg || 0);

            const priceCell = document.createElement('td');
            priceCell.textContent = formatCurrency(rowData.TotalPrice);

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
    dateInput.value = item.ExpenseDate;
    
    // Display farm and pig names but disable selection (read-only)
    farmSelect.innerHTML = `<option selected>${item.FarmName}</option>`;
    farmSelect.disabled = true;
    
    pigSelect.innerHTML = `<option selected>${item.PigName}</option>`;
    pigSelect.disabled = true;
    
    categorySelect.value = item.Category;
    priceInput.value = item.Amount;

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
    }).then(async (res) => {
        if (res.isConfirmed) {
            try {
                const userId = localStorage.getItem('userID');
                const expenseItem = expensesData[index];
                const expId = expenseItem.ExpID;

                const response = await fetch('http://localhost:8080/api/expenses-records/delete-expense', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        ExpID: expId,
                        UserID: userId
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to delete expense');
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Expense deleted',
                    showConfirmButton: false,
                    timer: 1500
                });

                // Refresh tables
                fetchExpensesTable();
                fetchExpensesandReports();

            } catch (error) {
                console.error('Error deleting expense:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete expense. Please try again.'
                });
            }
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

            if (editDateSold) editDateSold.value = item.DateSold;
            if (editFarmName) editFarmName.value = item.FarmName;
            if (editPigName) editPigName.value = item.PigName;
            if (editWeightSold) editWeightSold.value = item.Weight;
            if (editPricePerKg) editPricePerKg.value = item.PricePerKg;
            if (editTotalPrice) editTotalPrice.value = formatCurrency(item.TotalPrice);

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
            }).then(async (res) => {
                if (res.isConfirmed) {
                    try {
                        const userId = localStorage.getItem('userID');
                        const soldItem = soldData[index];
                        const expId = soldItem.ExpID;

                        const response = await fetch('http://localhost:8080/api/expenses-records/cancel-sold-pig', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                ExpID: expId,
                                UserID: userId
                            })
                        });

                        if (!response.ok) {
                            throw new Error('Failed to cancel sold record');
                        }

                        // Show success alert with an Undo option
                        Swal.fire({
                            icon: 'success',
                            title: 'Record cancelled',
                            showCancelButton: true,
                            confirmButtonText: 'Undo',
                            cancelButtonText: 'Close'
                        }).then(async (choice) => {
                            if (choice.isConfirmed) {
                                // User clicked Undo — need to re-create the sold record
                                try {
                                    // For now, just refresh the tables
                                    fetchSoldTable();
                                    fetchExpensesandReports();
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Record restored',
                                        showConfirmButton: false,
                                        timer: 1200
                                    });
                                } catch (undoError) {
                                    console.error('Error restoring record:', undoError);
                                }
                            } else {
                                // User closed or chose not to undo - refresh tables
                                fetchSoldTable();
                                fetchExpensesandReports();
                            }
                        });
                    } catch (error) {
                        console.error('Error cancelling sold record:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to cancel sold record. Please try again.'
                        });
                    }
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
            }).then(async (res) => {
                if (res.isConfirmed) {
                    try {
                        const userId = localStorage.getItem('userID');
                        const soldItem = soldData[index];
                        const expId = soldItem.ExpID;

                        const response = await fetch('http://localhost:8080/api/expenses-records/cancel-sold-pig', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                ExpID: expId,
                                UserID: userId
                            })
                        });

                        if (!response.ok) {
                            throw new Error('Failed to cancel sold record');
                        }

                        // Show success alert with an Undo option
                        Swal.fire({
                            icon: 'success',
                            title: 'Record cancelled',
                            showCancelButton: true,
                            confirmButtonText: 'Undo',
                            cancelButtonText: 'Close'
                        }).then(async (choice) => {
                            if (choice.isConfirmed) {
                                // User clicked Undo — need to re-create the sold record
                                try {
                                    // For now, just refresh the tables since we need to implement add-sold logic
                                    fetchSoldTable();
                                    fetchExpensesandReports();
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Record restored',
                                        showConfirmButton: false,
                                        timer: 1200
                                    });
                                } catch (undoError) {
                                    console.error('Error restoring record:', undoError);
                                }
                            } else {
                                // User closed or chose not to undo - refresh tables
                                fetchSoldTable();
                                fetchExpensesandReports();
                            }
                        });
                    } catch (error) {
                        console.error('Error cancelling sold record:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to cancel sold record. Please try again.'
                        });
                    }
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
        saveEditSoldBtn.addEventListener('click', async () => {
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

            try {
                const userId = localStorage.getItem('userID');
                const idx = parseInt(editingIndex);
                const soldItem = soldData[idx];
                const expId = soldItem.ExpID;
                const totalPrice = parseFloat(weightVal) * parseFloat(pricePerKgVal);

                const response = await fetch('http://localhost:8080/api/expenses-records/edit-expense', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        ExpID: expId,
                        UserID: userId,
                        Date: dateSoldVal,
                        Amount: parseFloat(pricePerKgVal),
                        Category: 'Sold'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update sold record');
                }

                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Sold record updated',
                    showConfirmButton: false,
                    timer: 1500
                });

                // Refresh tables
                fetchSoldTable();
                fetchExpensesandReports();

                // Close modal
                editSoldModal.classList.remove('show');
                document.body.style.overflow = '';

            } catch (error) {
                console.error('Error updating sold record:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update sold record. Please try again.'
                });
            }
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

async function openModal(isNew = true) {
    if (!addRemModal) return;

    // Load dropdown data from API
    await loadDropdownsFromAPI();

    addRemModal.classList.add('show');
    document.body.style.overflow = 'hidden';

    if (isNew) {
        // Reset editing state
        isEditing = false;
        editingIndex = null;

        // Clear inputs for new expense
        if (dateInput) dateInput.value = '';
        if (farmSelect) { farmSelect.value = ''; farmSelect.disabled = false; }
        if (pigSelect) { pigSelect.value = ''; pigSelect.disabled = false; }
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
            if (farmSelect) { farmSelect.value = ''; farmSelect.disabled = false; toggleHasValue(farmSelect); }
            if (pigSelect)  { pigSelect.value = ''; pigSelect.disabled = false; toggleHasValue(pigSelect); }
            if (categorySelect) { categorySelect.value = ''; toggleHasValue(categorySelect); }
            if (priceInput) { priceInput.value = ''; toggleHasValue(priceInput); }
            
            // Reset editing state
            isEditing = false;
            editingIndex = null;
        });
    }

if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
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

        const userId = localStorage.getItem('userID');
        const dateVal = dateInput.value;
        const amount = Number(priceVal);

        try {
            if (isEditing && editingIndex !== null) {
                // Update existing expense
                const expenseItem = expensesData[editingIndex];
                const expId = expenseItem.ExpID;

                const response = await fetch('http://localhost:8080/api/expenses-records/edit-expense', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        ExpID: expId,
                        UserID: userId,
                        Date: dateVal,
                        Amount: amount,
                        Category: categoryVal
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update expense');
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Expense updated',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                // Add new expense
                const pigId = pigSelect.value;
                
                const response = await fetch('http://localhost:8080/api/expenses-records/add-expense', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        UserID: userId,
                        PigID: pigId,
                        Date: dateVal,
                        Amount: amount,
                        Category: categoryVal
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to add expense');
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Expense added',
                    showConfirmButton: false,
                    timer: 1500
                });
            }

            // Refresh tables
            fetchExpensesTable();
            fetchExpensesandReports();

            // Reset modal
            if (clearBtn) clearBtn.click();
            closeModal();

            // Reset editing state
            isEditing = false;
            editingIndex = null;

        } catch (error) {
            console.error('Error saving expense:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save expense. Please try again.'
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

        // Populate filter dropdowns with data from tables
        populateFilterDropdowns();

        // toggle dropdown
        filterToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const becameVisible = !filterDropdown.classList.contains('show');
            filterDropdown.classList.toggle('show');
            // If opening the filter dropdown, refresh its contents so listeners and options are current
            if (becameVisible) populateFilterDropdowns();
        });

        // close when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterDropdown.contains(e.target) && !filterToggle.contains(e.target)) {
                filterDropdown.classList.remove('show');
            }
        });

        // update button label and apply filters
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                updateFilterLabel();
                applyExpensesFilters();
                applySoldFilters();
            });
        });

        function updateFilterLabel() {
            let values = [];
            filterSelects.forEach(select => {
                const val = select.value.trim();
                if (val !== "") {
                    // Get the display text from the selected option
                    const selectedOption = select.options[select.selectedIndex];
                    const displayText = selectedOption ? selectedOption.text : val;
                    values.push(displayText);
                }
            });

            filterLabel.textContent = values.length === 0 ? 'Filter' : values.join(' • ');
        }

        // Add clear filters button if needed (optional)
        // You can add a reset/clear button in the HTML and wire it here
    }

    /* ----------------------------------------------------
       INITIAL RENDER
    ---------------------------------------------------- */
    renderExpensesTable();
    renderSoldTable();
});
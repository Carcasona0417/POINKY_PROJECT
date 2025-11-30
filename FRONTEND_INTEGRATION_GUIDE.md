# Frontend Integration Quick Reference

## 🚀 Quick Start - Copy & Paste Ready

### Load Dropdowns When Modal Opens
```javascript
async function loadExpenseDropdowns() {
  const userId = localStorage.getItem('userID');
  
  try {
    // Fetch farms
    const farmsRes = await fetch('http://localhost:8080/api/expenses-records/dropdown-farms', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId })
    });
    const farmsData = await farmsRes.json();
    
    // Fetch pigs
    const pigsRes = await fetch('http://localhost:8080/api/expenses-records/dropdown-pigs', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId })
    });
    const pigsData = await pigsRes.json();
    
    // Fetch categories
    const categoriesRes = await fetch('http://localhost:8080/api/expenses-records/dropdown-categories', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({})
    });
    const categoriesData = await categoriesRes.json();
    
    // Populate selects
    populateFarmSelect(farmsData.farms);
    populatePigSelect(pigsData.pigs);
    populateCategorySelect(categoriesData.categories);
    
  } catch (error) {
    console.error('Error loading dropdowns:', error);
    Swal.fire('Error', 'Failed to load dropdown data', 'error');
  }
}

function populateFarmSelect(farms) {
  const farmSelect = document.querySelector('[data-id="farmSelect"]');
  farmSelect.innerHTML = '<option value="">-- Select Farm --</option>';
  farms.forEach(farm => {
    const option = document.createElement('option');
    option.value = farm.FarmID;
    option.textContent = farm.FarmName;
    farmSelect.appendChild(option);
  });
}

function populatePigSelect(pigs) {
  const pigSelect = document.querySelector('[data-id="pigSelect"]');
  pigSelect.innerHTML = '<option value="">-- Select Pig --</option>';
  pigs.forEach(pig => {
    const option = document.createElement('option');
    option.value = pig.PigID;
    option.textContent = `${pig.PigName} (${pig.FarmName})`;
    pigSelect.appendChild(option);
  });
}

function populateCategorySelect(categories) {
  const categorySelect = document.querySelector('[data-id="categorySelect"]');
  categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}
```

---

### Add New Expense
```javascript
async function saveExpense() {
  const userId = localStorage.getItem('userID');
  const pigId = document.querySelector('[data-id="pigSelect"]').value;
  const date = document.getElementById('pigDate').value;
  const amount = document.querySelector('input[type="number"]').value;
  const category = document.querySelector('[data-id="categorySelect"]').value;
  
  if (!pigId || !date || !amount || !category) {
    Swal.fire('Validation Error', 'Please fill all fields', 'warning');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:8080/api/expenses-records/add-expense', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        UserID: userId,
        PigID: pigId,
        Date: date,
        Amount: parseFloat(amount),
        Category: category
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      Swal.fire('Success', 'Expense added successfully', 'success');
      closeModal();
      refreshExpensesTable();
    } else {
      Swal.fire('Error', result.message, 'error');
    }
  } catch (error) {
    console.error('Error adding expense:', error);
    Swal.fire('Error', 'Failed to add expense', 'error');
  }
}
```

---

### Edit Existing Expense
```javascript
async function updateExpense(expenseId) {
  const userId = localStorage.getItem('userID');
  const date = document.getElementById('pigDate').value;
  const amount = document.querySelector('input[type="number"]').value;
  const category = document.querySelector('[data-id="categorySelect"]').value;
  
  try {
    const response = await fetch('http://localhost:8080/api/expenses-records/edit-expense', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        ExpID: expenseId,
        UserID: userId,
        Date: date,
        Amount: parseFloat(amount),
        Category: category
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      Swal.fire('Success', 'Expense updated successfully', 'success');
      closeModal();
      refreshExpensesTable();
    } else {
      Swal.fire('Error', result.message, 'error');
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    Swal.fire('Error', 'Failed to update expense', 'error');
  }
}
```

---

### Delete Expense
```javascript
function deleteExpenseWithConfirm(expenseId) {
  Swal.fire({
    icon: 'warning',
    title: 'Delete this expense?',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteExpense(expenseId);
    }
  });
}

async function deleteExpense(expenseId) {
  const userId = localStorage.getItem('userID');
  
  try {
    const response = await fetch('http://localhost:8080/api/expenses-records/delete-expense', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        ExpID: expenseId,
        UserID: userId
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      Swal.fire('Success', 'Expense deleted successfully', 'success');
      refreshExpensesTable();
    } else {
      Swal.fire('Error', result.message, 'error');
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    Swal.fire('Error', 'Failed to delete expense', 'error');
  }
}
```

---

### Cancel Sold Pig Record
```javascript
function cancelSoldPigWithConfirm(expenseId) {
  Swal.fire({
    icon: 'warning',
    title: 'Cancel this sale?',
    text: 'The pig will be marked back as "To Sale"',
    showCancelButton: true,
    confirmButtonText: 'Cancel Sale',
    cancelButtonText: 'No'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await cancelSoldPig(expenseId);
    }
  });
}

async function cancelSoldPig(expenseId) {
  const userId = localStorage.getItem('userID');
  
  try {
    const response = await fetch('http://localhost:8080/api/expenses-records/cancel-sold-pig', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        ExpID: expenseId,
        UserID: userId
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Sale Cancelled',
        text: 'Pig status has been reverted to "To Sale"',
        showConfirmButton: false,
        timer: 2000
      });
      refreshSoldTable();
    } else {
      Swal.fire('Error', result.message, 'error');
    }
  } catch (error) {
    console.error('Error cancelling sale:', error);
    Swal.fire('Error', 'Failed to cancel sale', 'error');
  }
}
```

---

### Refresh Expenses Table
```javascript
async function refreshExpensesTable() {
  const userId = localStorage.getItem('userID');
  
  try {
    const response = await fetch('http://localhost:8080/api/expenses-records/Expenses-Table', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId })
    });
    
    const data = await response.json();
    renderExpensesTable(data.ExpenseTable);
  } catch (error) {
    console.error('Error refreshing expenses:', error);
  }
}

function renderExpensesTable(expenses) {
  const tbody = document.getElementById('expensesTableBody');
  tbody.innerHTML = '';
  
  expenses.forEach((expense, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.farm}</td>
      <td>${expense.pig}</td>
      <td>${expense.category}</td>
      <td>₱${parseFloat(expense.price).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>
        <button class="btn-edit" data-id="${expense.ExpID}">Edit</button>
        <button class="btn-delete" data-id="${expense.ExpID}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}
```

---

### Refresh Sold Table
```javascript
async function refreshSoldTable() {
  const userId = localStorage.getItem('userID');
  
  try {
    const response = await fetch('http://localhost:8080/api/expenses-records/PigSold-Table', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId })
    });
    
    const data = await response.json();
    renderSoldTable(data.SoldTable);
  } catch (error) {
    console.error('Error refreshing sold table:', error);
  }
}

function renderSoldTable(soldPigs) {
  const tbody = document.getElementById('soldTableBody');
  tbody.innerHTML = '';
  
  soldPigs.forEach((record, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.dateSold}</td>
      <td>${record.farm}</td>
      <td>${record.pig}</td>
      <td>${record.weight} kg</td>
      <td>₱${parseFloat(record.pricePerKg).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>₱${parseFloat(record.totalPrice).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>
        <button class="btn-cancel" data-id="${record.ExpID}">Cancel Sale</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}
```

---

## 📌 Key Points

1. **Always include UserID** - Get from `localStorage.getItem('userID')`
2. **Handle dates as YYYY-MM-DD** - Use HTML date input
3. **Parse amounts as numbers** - Use `parseFloat()`
4. **Show user feedback** - Use SweetAlert2 for confirmations
5. **Refresh after operations** - Always refresh tables after add/edit/delete
6. **Error handling** - Always catch and display errors to user

---

## 🔧 Integration Checklist

- [ ] Add IDs to modal form elements
- [ ] Attach click handlers to Edit/Delete buttons
- [ ] Load dropdowns when modal opens
- [ ] Refresh tables after operations
- [ ] Add error handling and user feedback
- [ ] Test all CRUD operations
- [ ] Test cancel sold pig flow
- [ ] Verify dropdown filtering by user


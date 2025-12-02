// rem.js
document.addEventListener('DOMContentLoaded', async function () {
    /* ---------- ELEMENTS ---------- */
    const modalWrapper   = document.getElementById('addRem');
    const openModalBtn   = document.getElementById('addPigBtn');
    const closeModalBtn  = document.getElementById('CloseModal');

    const successModal   = document.getElementById('successModal');

    const clearBtn       = document.querySelector('.btn-clear');
    const saveBtn        = document.querySelector('.btn-save');

    const taskInput      = document.querySelector('.input-wrapper input[type="text"]');
    const dateInput      = document.getElementById('pigDate');
    const dateWrapper    = document.querySelector('.date-wrapper');
    const selects        = document.querySelectorAll('.form-select');
    const farmSelect     = selects[0];
    const pigSelect      = selects[1];
    const notesInput     = document.querySelector('.input-wrapper textarea');
    const calendarIcon   = document.querySelector('.calendar-icon');

    const tableBody      = document.getElementById('ReminderTable');
    const activeTodoSpan = document.getElementById('activetodoList');
    const showingCount   = document.getElementById('showingCount');
    const totalCount     = document.getElementById('totalCount');
    const searchInput    = document.getElementById('searchInput');

    let reminders = []; 
    let editingIndex = null; // null = adding new, number = editing
    let farms = [];
    let pigs  = [];
    // When true, suppress the global add/save click listener so edit-specific handler runs alone
    let suppressAddClick = false;

    async function fetchReminders() {
        const userId = localStorage.getItem('userID')
        try {
            const response = await fetch('http://localhost:8080/api/reminders/get-reminders', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userId })  
            });

            const data = await response.json();
            if (data.success) {
                // Map reminders and try to match FarmID/PigID from loaded farms/pigs
                reminders = data.reminders.map(rem => {
                    const farmEntry = farms.find(f => f.FarmName === rem.FarmName) || {};
                    const pigEntry  = pigs.find(p => p.PigName === rem.PigName) || {};
                    return {
                        id: rem.ReminderID || '',
                        task: rem.Title,
                        date: rem.Date,
                        farm: rem.FarmName || '',
                        farmId: farmEntry.FarmID || '',
                        pig: rem.PigName || '',
                        pigId: pigEntry.PigID || '',
                        notes: rem.Description || ''
                    };
                });
                renderTable();
            } else {
                console.error('Failed to fetch reminders:', data.message);
            }
        } catch (err) {
            console.error('Error fetching reminders:', err);
        }
    }

    // Load farms and pigs for dropdowns
    async function loadFarmsAndPigs() {
        const userId = localStorage.getItem('userID');
        if (!userId) return;

        try {
            const [farmsRes, pigsRes] = await Promise.all([
                fetch('http://localhost:8080/api/farm/get-user-farms', {
                    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ userId })
                }),
                fetch('http://localhost:8080/api/pigs/get-user-pigs', {
                    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ userId })
                })
            ]);

            const farmsData = await farmsRes.json();
            const pigsData  = await pigsRes.json();

            farms = (farmsData && farmsData.farms) ? farmsData.farms : [];
            pigs  = (pigsData && pigsData.pigs) ? pigsData.pigs : [];

            // Populate farm select (value = FarmID, text = FarmName)
            if (farmSelect) {
                farmSelect.innerHTML = '';
                const empty = document.createElement('option');
                empty.value = '';
                empty.textContent = '';
                farmSelect.appendChild(empty);
                farms.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f.FarmID;
                    opt.textContent = f.FarmName;
                    farmSelect.appendChild(opt);
                });
                toggleHasValue(farmSelect);
            }

            // Populate pig select (value = PigID, text = PigName)
            function populatePigOptions(list) {
                if (!pigSelect) return;
                pigSelect.innerHTML = '';
                const empty = document.createElement('option');
                empty.value = '';
                empty.textContent = '';
                pigSelect.appendChild(empty);
                list.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.PigID;
                    opt.textContent = p.PigName;
                    opt.dataset.farmid = p.FarmID || '';
                    pigSelect.appendChild(opt);
                });
                toggleHasValue(pigSelect);
            }

            populatePigOptions(pigs);

        } catch (err) {
            console.error('Failed to load farms/pigs:', err);
        }
    }

    // filter pigs by selected farm
    function filterPigsByFarm() {
        if (!pigSelect) return;
        const selectedFarm = farmSelect ? farmSelect.value : '';
        if (!selectedFarm) {
            // show all pigs
            pigSelect.innerHTML = '';
            const empty = document.createElement('option'); empty.value=''; empty.textContent=''; pigSelect.appendChild(empty);
            pigs.forEach(p => {
                const opt = document.createElement('option'); opt.value = p.PigID; opt.textContent = p.PigName; opt.dataset.farmid = p.FarmID || ''; pigSelect.appendChild(opt);
            });
        } else {
            const filtered = pigs.filter(p => p.FarmID === selectedFarm);
            pigSelect.innerHTML = '';
            const empty = document.createElement('option'); empty.value=''; empty.textContent=''; pigSelect.appendChild(empty);
            filtered.forEach(p => {
                const opt = document.createElement('option'); opt.value = p.PigID; opt.textContent = p.PigName; opt.dataset.farmid = p.FarmID || ''; pigSelect.appendChild(opt);
            });
        }
        toggleHasValue(pigSelect);
    }

    // attach filter listener
    farmSelect?.addEventListener('change', filterPigsByFarm);

    // initial load - ensure farms/pigs are loaded before fetching reminders
    await loadFarmsAndPigs();
    await fetchReminders();


    /* ---------- MODAL HANDLERS ---------- */
    function openModal() {
        if (!modalWrapper) return;
        modalWrapper.classList.add('show');
    }

    function closeModal() {
        if (!modalWrapper) return;
        modalWrapper.classList.remove('show');
    }

    openModalBtn?.addEventListener('click', openModal);
    closeModalBtn?.addEventListener('click', closeModal);

    // Close when clicking outside dialog
    modalWrapper?.addEventListener('click', function (e) {
        if (e.target === modalWrapper) closeModal();
    });

    /* ---------- DATE WRAPPER ANIMATION ---------- */
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

        // Initial state (in case pre-filled later)
        updateDateWrapperState();
    }

    // Calendar icon opens native picker or focuses input
    calendarIcon?.addEventListener('click', () => {
        if (!dateInput) return;
        if (typeof dateInput.showPicker === 'function') {
            dateInput.showPicker();
        } else {
            dateInput.focus();
        }
    });

    /* ---------- FLOATING LABEL HELPERS (TEXT, SELECT, TEXTAREA) ---------- */
    const textInputs  = document.querySelectorAll('.input-wrapper input[type="text"]');
    const textareas   = document.querySelectorAll('.input-wrapper textarea');
    const selectElems = document.querySelectorAll('.input-wrapper select');

    function toggleHasValue(el) {
        if (!el) return;
        if (el.value && el.value.trim() !== '') {
            el.classList.add('has-value');
        } else {
            el.classList.remove('has-value');
        }
    }

    // Text inputs
    textInputs.forEach(inp => {
        toggleHasValue(inp); // initial on load
        inp.addEventListener('input', () => toggleHasValue(inp));
        inp.addEventListener('blur',  () => toggleHasValue(inp));
    });

    // Textareas
    textareas.forEach(area => {
        toggleHasValue(area);
        area.addEventListener('input', () => toggleHasValue(area));
        area.addEventListener('blur',  () => toggleHasValue(area));
    });

    // Selects
    selectElems.forEach(sel => {
        toggleHasValue(sel);
        sel.addEventListener('change', () => toggleHasValue(sel));
        sel.addEventListener('blur',   () => toggleHasValue(sel));
    });

    /* ---------- SUCCESS ALERT ---------- */
    // Use SweetAlert if available; otherwise fall back to the DOM `successModal` element.
    function showSuccess(title = 'Saved', text = 'Operation completed', icon = 'success') {
        if (typeof window !== 'undefined' && window.Swal) {
            Swal.fire({
                icon,
                title,
                text,
                customClass: { popup: 'swal2-high-zindex' }
            });
            return;
        }
        if (!successModal) return;
        successModal.classList.add('show');
        setTimeout(() => {
            successModal.classList.remove('show');
        }, 2000);
    }

    /* ---------- FORM HELPERS ---------- */
    function clearForm() {
        if (taskInput)  {
            taskInput.value = '';
            toggleHasValue(taskInput);
        }
        if (dateInput)  {
            dateInput.value = '';
            updateDateWrapperState();
        }
        if (farmSelect) {
            farmSelect.value = '';
            toggleHasValue(farmSelect);
        }
        if (pigSelect)  {
            pigSelect.value = '';
            toggleHasValue(pigSelect);
        }
        if (notesInput) {
            notesInput.value = '';
            toggleHasValue(notesInput);
        }
    }

    clearBtn?.addEventListener('click', clearForm);

    /* ---------- TABLE RENDERING ---------- */
function renderTable(filteredList = null) {
    const list = filteredList || reminders;
    if (!tableBody) return;

    tableBody.innerHTML = '';

    list.forEach((rem, index) => { // <-- keep track of index for edit/delete
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${rem.date  || '-'}</td>
            <td>${rem.task  || '-'}</td>
            <td>${rem.farm  || '-'}</td>
            <td>${rem.pig   || '-'}</td>
            <td>${rem.notes || '-'}</td>
            <td>
                <button class="edit-btn" data-index="${index}" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="delete-btn" data-index="${index}" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);

        // Edit button
        tr.querySelector('.edit-btn').addEventListener('click', () => {
            editReminder(index);
        });

        // Delete button
        tr.querySelector('.delete-btn').addEventListener('click', () => {
            deleteReminder(index);
        });
    });

    const total   = reminders.length;
    const showing = list.length;

    if (activeTodoSpan) activeTodoSpan.textContent = total;
    if (totalCount)     totalCount.textContent     = total;
    if (showingCount)   showingCount.textContent   = showing;
}

/* ---------- EDIT REMINDER ---------- */
function editReminder(index) {
    const rem = reminders[index];
    if (!rem) return;

     editingIndex = index;

    // Pre-fill modal inputs
    dateInput.value   = rem.date;
    taskInput.value   = rem.task;
    // farm/pig returned from server are names; find matching option values
    if (farmSelect) {
        const match = Array.from(farmSelect.options).find(o => o.text === rem.farm || o.value === rem.farm);
        farmSelect.value = match ? match.value : '';
    }
    if (pigSelect) {
        const matchP = Array.from(pigSelect.options).find(o => o.text === rem.pig || o.value === rem.pig);
        pigSelect.value = matchP ? matchP.value : '';
    }
    notesInput.value  = rem.notes;

    toggleHasValue(taskInput);
    toggleHasValue(farmSelect);
    toggleHasValue(pigSelect);
    toggleHasValue(notesInput);
    updateDateWrapperState();

    // Open modal
    modalWrapper.classList.add('show');

    // Change save button behavior temporarily
    suppressAddClick = true;
    saveBtn.onclick = async () => {
        // Update the reminder values from inputs
        const newDate  = dateInput.value;
        const newTask  = taskInput.value.trim();
        const newFarmId= farmSelect.value;
        const newPigId = pigSelect.value;
        const newNotes = notesInput.value.trim();

        // Basic validation (prevent sending null/empty Task or Date to backend)
        if (!newTask) {
            if (window.Swal) Swal.fire('Missing field', 'Task is required', 'warning'); else alert('Task is required');
            return;
        }
        if (!newDate) {
            if (window.Swal) Swal.fire('Missing field', 'Date is required', 'warning'); else alert('Date is required');
            return;
        }
        // Prevent past dates
        const sel = new Date(newDate);
        const today = new Date(); today.setHours(0,0,0,0);
        if (sel < today) {
            if (window.Swal) Swal.fire('Invalid date', 'Date must be today or in the future', 'warning'); else alert('Date must be today or in the future');
            return;
        }

        // If the reminder has an ID, call backend to update
        if (rem.id) {
            const userId = localStorage.getItem('userID');
            // Prefer newly selected IDs; fall back to the existing reminder's IDs to avoid sending null
            const farmIdToSend = newFarmId && newFarmId !== '' ? newFarmId : (rem.farmId && rem.farmId !== '' ? rem.farmId : null);
            const pigIdToSend  = newPigId  && newPigId !== ''  ? newPigId  : (rem.pigId  && rem.pigId  !== '' ? rem.pigId  : null);

            const payload = {
                userId,
                farmId: farmIdToSend,
                pigId: pigIdToSend,
                // If the date input is empty, fall back to the existing reminder date
                date: (newDate && newDate !== '') ? newDate : (rem.date || null),
                task: newTask,
                notes: newNotes
            };
            try {
                // Include the reminder ID in the URL so backend receives it via req.params.remID
                const resp = await fetch(`http://localhost:8080/api/reminders/edit-reminder/${encodeURIComponent(rem.id)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await resp.json();
                if (!data.success) {
                    const msg = data.message || 'Failed to update reminder';
                    if (window.Swal) Swal.fire('Error', msg, 'error'); else alert(msg);
                    return;
                }
                // show success using Swal (preferred) or fallback modal
                showSuccess('Saved', 'Reminder updated successfully');
            } catch (err) {
                console.error('Failed to update reminder:', err);
                if (window.Swal) Swal.fire('Error', 'Failed to update reminder', 'error'); else alert('Failed to update reminder');
                return;
            }
        }

        // Update locally for display (either after backend success or for local-only items)
        const farmName = farmSelect?.selectedOptions?.[0]?.text || rem.farm || '';
        const pigName  = pigSelect?.selectedOptions?.[0]?.text  || rem.pig  || '';

        rem.date   = newDate;
        rem.task   = newTask;
        rem.farm   = farmName;
        rem.farmId = newFarmId || rem.farmId || '';
        rem.pig    = pigName;
        rem.pigId  = newPigId || rem.pigId || '';
        rem.notes  = newNotes;

        renderTable();
        showSuccess();
        clearForm();
        closeModal();

        // Restore save button for adding new
        saveBtn.onclick = saveNewReminder;
        suppressAddClick = false;
    };
}

/* ---------- DELETE REMINDER ---------- */
function deleteReminder(index) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete the task.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const rem = reminders[index];
                // If reminder has an ID, call backend to delete
                if (rem && rem.id) {
                    try {
                        const resp = await fetch(`http://localhost:8080/api/reminders/${encodeURIComponent(rem.id)}`, { method: 'DELETE' });
                        const data = await resp.json();
                        if (!data.success) {
                            const msg = data.message || 'Failed to delete reminder';
                            Swal.fire('Error', msg, 'error');
                            return;
                        }
                    } catch (err) {
                        console.error('Failed to delete reminder:', err);
                        Swal.fire('Error', 'Failed to delete reminder', 'error');
                        return;
                    }
                }

                // Remove locally and update UI
                reminders.splice(index, 1);
                renderTable();
                Swal.fire('Deleted!', 'Reminder has been deleted.', 'success');
            }
        });
    } else {
        if (confirm("Are you sure you want to delete this reminder?")) {
            const rem = reminders[index];
            if (rem && rem.id) {
                fetch(`http://localhost:8080/api/reminders/${encodeURIComponent(rem.id)}`, { method: 'DELETE' })
                    .then(resp => resp.json())
                    .then(data => {
                        if (!data.success) { alert(data.message || 'Failed to delete reminder'); return; }
                        reminders.splice(index, 1);
                        renderTable();
                    })
                    .catch(err => { console.error('Failed to delete reminder:', err); alert('Failed to delete reminder'); });
            } else {
                reminders.splice(index, 1);
                renderTable();
            }
        }
    }
}

/* ---------- SAVE BUTTON ---------- */
function saveNewReminder() {
    const task  = taskInput ? taskInput.value.trim() : '';
    const date  = dateInput ? dateInput.value : '';
    const farm  = farmSelect ? farmSelect.value : '';
    const pig   = pigSelect ? pigSelect.value : '';
    const notes = notesInput ? notesInput.value.trim() : '';

    // Validation
    if (!task || !date) {
        if (window.Swal) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing fields',
                text: 'Please fill in at least the Task and Date.',
                customClass: {
                    popup: 'swal2-high-zindex'
                }
            });
        } else {
            alert('Please fill in at least the Task and Date.');
        }
        return;
    }

        // Add new reminder (local fallback)
        reminders.push({ task, date, farm, pig, notes });

        renderTable();
        if (window.Swal) {
            Swal.fire('Saved', 'Reminder added successfully', 'success');
        } else {
            showSuccess();
        }
        clearForm();
        closeModal();
}

// Attach save handler to save button
saveBtn?.addEventListener('click', async () => {
    const task  = taskInput.value.trim();
    const date  = dateInput.value;
    const farm  = farmSelect.value;
    const pig   = pigSelect.value;
    const notes = notesInput.value.trim();

    // Function to show error under an input
    function showError(input, message) {
        let errorContainer = input.parentElement.nextElementSibling;
        if (!errorContainer || !errorContainer.classList.contains('error-message')) {
            errorContainer = document.createElement('span');
            errorContainer.classList.add('error-message');
            errorContainer.style.color = 'red';
            errorContainer.style.fontSize = '0.85rem';
            errorContainer.style.display = 'block';
            errorContainer.style.marginTop = '4px';
            input.parentElement.parentElement.insertBefore(errorContainer, input.parentElement.nextSibling);
        }
        errorContainer.textContent = message;
    }

    // If an edit-specific handler is active, suppress the add/save global listener
    if (suppressAddClick) return;

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(span => span.remove());

    let valid = true;

    // Validate Task
    if (!task) {
        showError(taskInput, 'Task is required');
        valid = false;
    }

    // Validate Date
    if (!date) {
        showError(dateInput, 'Date is required');
        valid = false;
    } else {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0,0,0,0); // remove time
        if (selectedDate < today) {
            showError(dateInput, 'Date must be today or in the future');
            valid = false;
        }
    }

    if (!valid) return; // stop if validation fails

    // If editing, update locally (no backend update endpoint currently)
    if (editingIndex !== null) {
        // Display names for farm/pig by looking up the selected options' text
        const farmName = farmSelect?.selectedOptions?.[0]?.text || farm;
        const pigName  = pigSelect?.selectedOptions?.[0]?.text  || pig;
        reminders[editingIndex] = { task, date, farm: farmName, pig: pigName, notes };
        editingIndex = null;
        renderTable();
        showSuccess();
        clearForm();
        closeModal();
        return;
    }
        // If editing, update locally (no backend update endpoint currently)
        if (editingIndex !== null) {
            const farmName = farmSelect?.selectedOptions?.[0]?.text || farm;
            const pigName  = pigSelect?.selectedOptions?.[0]?.text  || pig;
            reminders[editingIndex] = { task, date, farm: farmName, pig: pigName, notes };
            editingIndex = null;
            renderTable();
            if (window.Swal) {
                Swal.fire('Saved', 'Reminder updated successfully', 'success');
            } else {
                showSuccess();
            }
            clearForm();
            closeModal();
            return;
        }

    // Creating a new reminder -> call backend API
    const userId = localStorage.getItem('userID');
    const payload = { userId, farmId: farm || null, pigId: pig || null, date, task, notes };

    saveBtn.disabled = true;
    try {
        const resp = await fetch('http://localhost:8080/api/reminders/add-reminder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (data.success) {
            // refresh list from server to get consistent FarmName/PigName display
            await fetchReminders();
            showSuccess('Saved', 'Reminder added successfully');
            clearForm();
            closeModal();
        } else {
            const msg = data.message || 'Failed to add reminder';
            if (window.Swal) Swal.fire('Error', msg, 'error'); else alert(msg);
        }
    } catch (err) {
        console.error('Error adding reminder:', err);
        if (window.Swal) Swal.fire('Error', 'Failed to add reminder', 'error'); else alert('Failed to add reminder');
    } finally {
        saveBtn.disabled = false;
    }
});





    /* ---------- SEARCH / FILTER ---------- */
    searchInput?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        if (!q) {
            renderTable();
            return;
        }

        const filtered = reminders.filter(rem =>
            (rem.task  && rem.task.toLowerCase().includes(q)) ||
            (rem.farm  && rem.farm.toLowerCase().includes(q)) ||
            (rem.pig   && rem.pig.toLowerCase().includes(q))  ||
            (rem.notes && rem.notes.toLowerCase().includes(q))||
            (rem.date  && rem.date.toLowerCase().includes(q))
        );

        renderTable(filtered);
    });

    /* ---------- INITIAL RENDER ---------- */
    renderTable();
});


// Profile modal functionality removed from this file.



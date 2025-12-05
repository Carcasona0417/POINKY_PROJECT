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
    let editingIndex = null; // null = adding, number = editing
    let farms = [];
    let pigs = [];

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

            // Populate farm select
            if (farmSelect) {
                farmSelect.innerHTML = '';
                const empty = document.createElement('option'); empty.value = ''; empty.textContent = ''; farmSelect.appendChild(empty);
                farms.forEach(f => { const opt = document.createElement('option'); opt.value = f.FarmID; opt.textContent = f.FarmName; farmSelect.appendChild(opt); });
                toggleHasValue(farmSelect);
            }

            // Populate pig select
            if (pigSelect) {
                pigSelect.innerHTML = '';
                const empty = document.createElement('option'); empty.value = ''; empty.textContent = ''; pigSelect.appendChild(empty);
                pigs.forEach(p => { const opt = document.createElement('option'); opt.value = p.PigID; opt.textContent = p.PigName; opt.dataset.farmid = p.FarmID || ''; pigSelect.appendChild(opt); });
                toggleHasValue(pigSelect);
            }

        } catch (err) {
            console.error('Failed to load farms/pigs:', err);
        }
    }

    async function fetchReminders() {
        const userId = localStorage.getItem('userID');
        try {
            const response = await fetch('http://localhost:8080/api/reminders/get-reminders', {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ userId })
            });
            const data = await response.json();
            if (data.success) {
                reminders = data.reminders.map(rem => ({
                    id: rem.ReminderID || '',
                    task: rem.Title,
                    date: rem.Date,
                    farm: rem.FarmName || '',
                    farmId: rem.FarmID || '',
                    pig: rem.PigName || '',
                    pigId: rem.PigID || '',
                    notes: rem.Description || ''
                }));
                renderTable();
            } else {
                console.error('Failed to fetch reminders:', data.message);
            }
        } catch (err) {
            console.error('Error fetching reminders:', err);
        }
    }

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

    // Calendar icon opens native picker or focuses input (with validation)
    function openDatePicker(input) {
        if (!input) return;
        try {
            if (typeof input.showPicker === 'function') {
                input.showPicker();
                return;
            }
        } catch (e) {}
        try { input.focus(); input.click(); } catch (e) {}
    }

    // Inline error element for date validation (too-old dates)
    let remDateError = null;
    if (dateWrapper) {
        remDateError = dateWrapper.querySelector('.date-error');
        if (!remDateError) {
            remDateError = document.createElement('div');
            remDateError.className = 'date-error';
            remDateError.style.display = 'none';
            dateWrapper.appendChild(remDateError);
        }
    }

    function validateRemDate() {
        if (!dateInput) return;
        if (!dateInput.value) {
            dateInput.setCustomValidity('');
            if (remDateError) remDateError.style.display = 'none';
            return true;
        }
        const picked = new Date(dateInput.value + 'T00:00:00');
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        if (picked < oneYearAgo) {
            dateInput.setCustomValidity('Date must be within the last year');
            if (remDateError) {
                remDateError.textContent = 'Date is too old — please choose a date within the past year.';
                remDateError.style.display = 'block';
            }
            return false;
        }
        dateInput.setCustomValidity('');
        if (remDateError) remDateError.style.display = 'none';
        return true;
    }

    calendarIcon?.addEventListener('click', () => {
        openDatePicker(dateInput);
    });

    dateInput?.addEventListener('change', () => {
        // clear previous inline date error when user changes value
        if (remDateError) { remDateError.textContent = ''; remDateError.style.display = 'none'; }
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

    /* ---------- SUCCESS MODAL ---------- */
    function showSuccess() {
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

        list.forEach((rem, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rem.date  || '-'}</td>
                <td>${rem.task  || '-'}</td>
                <td>${rem.farm  || '-'}</td>
                <td>${rem.pig   || '-'}</td>
                <td>${rem.notes || '-'}</td>
                <td>
                    <button class="edit-btn" data-index="${index}" title="Edit">Edit</button>
                    <button class="delete-btn" data-index="${index}" title="Delete">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);

            tr.querySelector('.edit-btn').addEventListener('click', () => editReminder(index));
            tr.querySelector('.delete-btn').addEventListener('click', () => deleteReminder(index));
        });

        const total   = reminders.length;
        const showing = list.length;

        if (activeTodoSpan) activeTodoSpan.textContent = total;
        if (totalCount)     totalCount.textContent     = total;
        if (showingCount)   showingCount.textContent   = showing;
    }

    // Edit handler
    function editReminder(index) {
        const rem = reminders[index];
        if (!rem) return;
        editingIndex = index;

        // Pre-fill
        if (dateInput) dateInput.value = rem.date || '';
        if (taskInput) taskInput.value = rem.task || '';
        if (notesInput) notesInput.value = rem.notes || '';
        if (farmSelect) {
            const match = Array.from(farmSelect.options).find(o => o.value === rem.farmId || o.text === rem.farm);
            farmSelect.value = match ? match.value : '';
        }
        if (pigSelect) {
            const match = Array.from(pigSelect.options).find(o => o.value === rem.pigId || o.text === rem.pig);
            pigSelect.value = match ? match.value : '';
        }

        toggleHasValue(taskInput); toggleHasValue(farmSelect); toggleHasValue(pigSelect); toggleHasValue(notesInput);
        updateDateWrapperState();
        modalWrapper.classList.add('show');

        // Temporary save behavior
        saveBtn.onclick = async () => {
            const newTask = taskInput.value.trim();
            const newDate = dateInput.value;
            const newFarm = farmSelect.value;
            const newPig  = pigSelect.value;
            const newNotes= notesInput.value.trim();

            // Prepare IDs to send
            const farmIdToSend = newFarm && newFarm !== '' ? newFarm : (rem.farmId && rem.farmId !== '' ? rem.farmId : null);
            const pigIdToSend  = newPig  && newPig  !== '' ? newPig  : (rem.pigId  && rem.pigId  !== '' ? rem.pigId  : null);

            if (rem.id) {
                const userId = localStorage.getItem('userID');
                const payload = { userId, farmId: farmIdToSend, pigId: pigIdToSend, date: newDate, task: newTask, notes: newNotes };
                try {
                    const resp = await fetch(`http://localhost:8080/api/reminders/${encodeURIComponent(rem.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    const data = await resp.json();
                    if (!data.success) { alert(data.message || 'Failed to update reminder'); return; }
                } catch (err) { console.error('Failed to update reminder:', err); alert('Failed to update reminder'); return; }
            }

            // Update local
            const farmName = farmSelect?.selectedOptions?.[0]?.text || rem.farm || '';
            const pigName  = pigSelect?.selectedOptions?.[0]?.text  || rem.pig  || '';
            rem.task = newTask; rem.date = newDate; rem.farm = farmName; rem.farmId = farmIdToSend || ''; rem.pig = pigName; rem.pigId = pigIdToSend || ''; rem.notes = newNotes;

            renderTable(); showSuccess(); clearForm(); closeModal();
            saveBtn.onclick = null;
        };
    }

    // Delete handler
    function deleteReminder(index) {
        const rem = reminders[index];
        if (confirm('Delete this reminder?')) {
            if (rem && rem.id) {
                fetch(`http://localhost:8080/api/reminders/${encodeURIComponent(rem.id)}`, { method: 'DELETE' })
                    .then(r => r.json()).then(data => {
                        if (!data.success) { alert(data.message || 'Failed to delete reminder'); return; }
                        reminders.splice(index,1); renderTable();
                    }).catch(err => { console.error('Failed to delete reminder:', err); alert('Failed to delete reminder'); });
            } else {
                reminders.splice(index,1); renderTable();
            }
        }
    }

    /* ---------- SAVE BUTTON ---------- */
    saveBtn?.addEventListener('click', () => {
        const task  = taskInput ? taskInput.value.trim() : '';
        const date  = dateInput ? dateInput.value : '';
        const farm  = farmSelect ? farmSelect.value : '';
        const pig   = pigSelect ? pigSelect.value : '';
        const notes = notesInput ? notesInput.value.trim() : '';

        // Clear previous inline task error
        const taskWrapper = taskInput ? taskInput.closest('.input-wrapper') : null;
        if (taskWrapper) {
            const prev = taskWrapper.querySelector('.field-error');
            if (prev) { prev.textContent = ''; prev.style.display = 'none'; }
        }

        // Validation: task required
        if (!task) {
            if (taskWrapper) {
                let el = taskWrapper.querySelector('.field-error');
                if (!el) {
                    el = document.createElement('span');
                    el.className = 'field-error';
                    taskWrapper.appendChild(el);
                }
                el.textContent = 'Please enter a task.';
                el.style.display = 'block';
                taskInput.focus();
            }
            return;
        }

        // Validation: date (use existing validator)
        const okDate = validateRemDate();
        if (!okDate) {
            if (dateInput) dateInput.focus();
            return;
        }

        // Add to list
        reminders.push({ task, date, farm, pig, notes });

        // Re-render table + update counts
        renderTable();
        showSuccess();
        clearForm();
        closeModal();
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

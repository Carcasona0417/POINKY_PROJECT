// rem.js
document.addEventListener('DOMContentLoaded', function () {
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
    farmSelect.value  = rem.farm;
    pigSelect.value   = rem.pig;
    notesInput.value  = rem.notes;

    toggleHasValue(taskInput);
    toggleHasValue(farmSelect);
    toggleHasValue(pigSelect);
    toggleHasValue(notesInput);
    updateDateWrapperState();

    // Open modal
    modalWrapper.classList.add('show');

    // Change save button behavior temporarily
    saveBtn.onclick = () => {
        // Update the reminder
        rem.date  = dateInput.value;
        rem.task  = taskInput.value.trim();
        rem.farm  = farmSelect.value;
        rem.pig   = pigSelect.value;
        rem.notes = notesInput.value.trim();

        renderTable();
        showSuccess();
        clearForm();
        closeModal();

        // Restore save button for adding new
        saveBtn.onclick = saveNewReminder;
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
        }).then((result) => {
            if (result.isConfirmed) {
                reminders.splice(index, 1);
                renderTable();
                Swal.fire('Deleted!', 'Reminder has been deleted.', 'success');
            }
        });
    } else {
        if (confirm("Are you sure you want to delete this reminder?")) {
            reminders.splice(index, 1);
            renderTable();
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

    // Add new reminder
    reminders.push({ task, date, farm, pig, notes });

    renderTable();
    showSuccess();
    clearForm();
    closeModal();
}

// Attach saveNewReminder to save button initially
saveBtn?.addEventListener('click', () => {
    const task  = taskInput.value.trim();
    const date  = dateInput.value;
    const farm  = farmSelect.value;
    const pig   = pigSelect.value;
    const notes = notesInput.value.trim();

    // Function to show error under an input
    function showError(input, message) {
    // Check if an error container exists; if not, create one after .input-wrapper
    let errorContainer = input.parentElement.nextElementSibling;
    if (!errorContainer || !errorContainer.classList.contains('error-message')) {
        errorContainer = document.createElement('span');
        errorContainer.classList.add('error-message');
        errorContainer.style.color = 'red';
        errorContainer.style.fontSize = '0.85rem';
        errorContainer.style.display = 'block';
        errorContainer.style.marginTop = '4px';
        // Insert after the input wrapper
        input.parentElement.parentElement.insertBefore(errorContainer, input.parentElement.nextSibling);
    }
    errorContainer.textContent = message;
}

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

    // Add or edit reminder
    if (editingIndex !== null) {
        reminders[editingIndex] = { task, date, farm, pig, notes };
        editingIndex = null;
    } else {
        reminders.push({ task, date, farm, pig, notes });
    }

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



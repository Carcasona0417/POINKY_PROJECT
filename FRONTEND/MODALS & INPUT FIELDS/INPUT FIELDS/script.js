document.addEventListener('DOMContentLoaded', function () {
    /* ---------- ELEMENTS ---------- */
    const ModalField   = document.getElementById('ModalField');
    const OpenModal    = document.getElementById('OpenModal');
    const closeAddBtn  = document.getElementById('CloseModal');
    const saveBtn      = document.querySelector('.btn-save');
    const clearBtn     = document.querySelector('.btn-clear');
    const successModal = document.getElementById('successModal');

    const dateInput     = document.getElementById('pigDate'); // still ok to keep
    const calendarIcon  = document.querySelector('.calendar-icon');
    const dateWrapper   = document.querySelector('.date-wrapper');
    const weightWrapper = document.querySelector('.weight-wrapper');
    const weightInput   = weightWrapper ? weightWrapper.querySelector('input[type="number"]') : null;

    // keep reference to Task / Title input if you want to use it later
    const taskTitleInput = document.querySelector('.input-wrapper input[type="text"]');

    /* ---------- OPEN / CLOSE ADD PIG / ADD TASK MODAL ---------- */
    if (OpenModal && ModalField) {
        OpenModal.addEventListener('click', () => {
            ModalField.classList.add('show');
        });
    }

    if (closeAddBtn && ModalField) {
        closeAddBtn.addEventListener('click', () => {
            ModalField.classList.remove('show');
        });
    }

    // click outside dialog to close
    if (ModalField) {
        ModalField.addEventListener('click', (e) => {
            if (e.target === ModalField) {
                ModalField.classList.remove('show');
            }
        });
    }

    /* ---------- DATE FIELDS (ALL .date-wrapper) ---------- */
    document.querySelectorAll('.date-wrapper').forEach(wrapper => {
        const dInput  = wrapper.querySelector('input[type="date"]');
        const cIcon   = wrapper.querySelector('.calendar-icon');

        if (!dInput) return;

        if (cIcon) {
            cIcon.addEventListener('click', () => {
                dInput.focus();
                wrapper.classList.add('is-focused');

                if (dInput.showPicker) {
                    dInput.showPicker();
                }
            });
        }

        dInput.addEventListener('focus', () => {
            wrapper.classList.add('is-focused');
        });

        dInput.addEventListener('blur', () => {
            wrapper.classList.remove('is-focused');
        });

        function updateDateState() {
            if (dInput.value) {
                wrapper.classList.add('has-value');
            } else {
                wrapper.classList.remove('has-value');
            }
        }

        dInput.addEventListener('change', updateDateState);
        updateDateState();
    });

    /* FLOAT LABEL FOR SELECT */
    document.querySelectorAll("select").forEach(sel => {
        sel.addEventListener("change", function () {
            if (this.value !== "") {
                this.classList.add("has-value");
            } else {
                this.classList.remove('has-value');
            }
        });
    });

    /* INITIAL WEIGHT – color kg box on focus */
    if (weightWrapper && weightInput) {
        weightInput.addEventListener('focus', () => {
            weightWrapper.classList.add('is-focused');
        });
        weightInput.addEventListener('blur', () => {
            weightWrapper.classList.remove('is-focused');
        });
    }

    /* FLOAT LABEL FOR TEXTAREA (ADDITIONAL NOTE) */
    document.querySelectorAll(".input-wrapper textarea").forEach(area => {
        area.addEventListener("focus", function () {
            this.parentElement.classList.add("is-focused");
        });
        area.addEventListener("blur", function () {
            this.parentElement.classList.remove("is-focused");
        });
        area.addEventListener("input", function () {
            if (this.value.trim() !== "") {
                this.classList.add("has-value");
            } else {
                this.classList.remove("has-value");
            }
        });
    });

    /* FLOAT LABEL FOR FILE INPUT (UPLOAD PHOTO) */
    document.querySelectorAll(".input-wrapper input[type='file']").forEach(fileInput => {
        fileInput.addEventListener("change", function () {
            if (this.files && this.files.length > 0) {
                this.classList.add("has-value");
            } else {
                this.classList.remove("has-value");
            }
        });

        fileInput.addEventListener("focus", function () {
            this.parentElement.classList.add("is-focused");
        });

        fileInput.addEventListener("blur", function () {
            this.parentElement.classList.remove("is-focused");
        });
    });

    /* ---------- CLEAR BUTTON ---------- */
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            // Clear all text & number inputs (except file handled separately below)
            document.querySelectorAll('.input-wrapper input').forEach(inp => {
                if (inp.type !== 'file') {
                    inp.value = "";
                } else {
                    inp.value = "";
                    inp.classList.remove('has-value');
                }
            });

            // Clear textareas
            document.querySelectorAll('.input-wrapper textarea').forEach(area => {
                area.value = "";
                area.classList.remove('has-value');
            });

            // Reset selects and floating labels
            document.querySelectorAll('.input-wrapper select').forEach(sel => {
                sel.value = "";
                sel.classList.remove('has-value');
            });

            // Reset ALL date field states
            document.querySelectorAll('.date-wrapper').forEach(wrapper => {
                const dInp = wrapper.querySelector('input[type="date"]');
                if (dInp) dInp.value = "";
                wrapper.classList.remove('has-value', 'is-focused');
            });

            // Reset weight wrapper focus state
            if (weightWrapper) {
                weightWrapper.classList.remove('is-focused');
            }
        });
    }

    /* ---------- SAVE BUTTON → SUCCESS MODAL ---------- */
    if (saveBtn && successModal && ModalField) {
        saveBtn.addEventListener('click', function (e) {
            e.preventDefault();

            // Show success modal
            successModal.classList.remove('show');
            void successModal.offsetWidth; // restart animation
            successModal.classList.add('show');

            // After delay: hide success + close Add form
            setTimeout(() => {
                successModal.classList.remove('show');
                ModalField.classList.remove('show');

                // 🔹 CLEAR FORM HERE so next open is empty
                document.querySelectorAll('.input-wrapper input').forEach(inp => {
                    if (inp.type !== 'file') {
                        inp.value = "";
                    } else {
                        inp.value = "";
                        inp.classList.remove('has-value');
                    }
                });

                document.querySelectorAll('.input-wrapper textarea').forEach(area => {
                    area.value = "";
                    area.classList.remove('has-value');
                });

                document.querySelectorAll('.input-wrapper select').forEach(sel => {
                    sel.value = "";
                    sel.classList.remove('has-value');
                });

                // reset all date wrappers
                document.querySelectorAll('.date-wrapper').forEach(wrapper => {
                    const dInp = wrapper.querySelector('input[type="date"]');
                    if (dInp) dInp.value = "";
                    wrapper.classList.remove('has-value', 'is-focused');
                });

                if (weightWrapper) {
                    weightWrapper.classList.remove('is-focused');
                }
            }, 1600);
        });

        // Optional: click outside success box to close immediately
        successModal.addEventListener('click', function (e) {
            if (e.target === successModal) {
                successModal.classList.remove('show');
            }
        });
    }
});














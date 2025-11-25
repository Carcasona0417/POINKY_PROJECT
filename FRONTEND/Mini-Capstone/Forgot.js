// --- Helper Function to manage step transitions ---
const showStep = (stepId) => {
    // Hide all steps
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('active-step');
        card.classList.add('hidden-step');
    });

    // Show the target step
    const targetStep = document.getElementById(stepId);
    if (targetStep) {
        targetStep.classList.remove('hidden-step');
        targetStep.classList.add('active-step');
    }
};

// --- SweetAlert2 Configuration for consistent styling ---
const fireAlert = (icon, title, text, confirmButtonText = 'OK') => {
    return Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonText: confirmButtonText,
        confirmButtonColor: '#f7a0b3', // Uses our primary pink color
        customClass: {
            title: 'swal2-title-custom',
            content: 'swal2-content-custom'
        }
    });
};

// --- Step 1: Email Input Handler (UPDATED) ---
document.getElementById('form-email').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();

    // Basic Email Validation
    if (!email) {
        fireAlert('error', 'Error', 'Please enter a valid email address.');
        return;
    }

    // SIMULATED SUCCESS: Show confirmation alert, then transition to Step 2
    fireAlert('success', 'Email Sent!', `A 4-digit verification code has been sent to ${email}.`, 'Continue')
        .then((result) => {
            // This 'then' block runs after the user clicks 'Continue' or dismisses the alert.
            if (result.isConfirmed || result.isDismissed) {
                // Now we transition to the next step: Verify Code
                showStep('step-verify-code');
            }
        });
});


// --- Step 2: Code Input Handler ---
document.getElementById('form-code').addEventListener('submit', function(e) {
    e.preventDefault();
    const codeInputs = document.querySelectorAll('#form-code .code-box');
    let code = '';
    
    // Concatenate the four code inputs
    codeInputs.forEach(input => {
        code += input.value;
    });

    // Code Validation (Example: Must be 4 digits)
    if (code.length !== 4 || !/^\d+$/.test(code)) {
        fireAlert('error', 'Invalid Code', 'Please enter the 4-digit code correctly.');
        return;
    }

    // SIMULATED SUCCESS: Assume code is correct, move to New Password step
    fireAlert('success', 'Code Verified!', 'Verification successful. You can now set a new password.', 'Set New Password')
        .then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                showStep('step-new-password');
            }
        });
});

// --- Step 2: Resend Code Handler ---
document.getElementById('resend-code').addEventListener('click', function(e) {
    e.preventDefault();
    fireAlert('info', 'Code Resent', 'A new verification code has been sent to your email.');
});


// --- Step 3: New Password Handler ---
document.getElementById('form-new-password').addEventListener('submit', function(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;

    // Password Validation (Example: Minimum length check)
    if (newPass.length < 6) {
        fireAlert('warning', 'Weak Password', 'Password must be at least 6 characters long.');
        return;
    }

    // Confirmation Check
    if (newPass !== confirmPass) {
        fireAlert('error', 'Mismatched Passwords', 'The new password and confirmation password do not match.');
        return;
    }

    // SIMULATED FINAL SUCCESS: Password updated!
    fireAlert('success', 'Password Updated! 🎉', 'Your password has been successfully reset. Please log in with your new password.', 'Go to Login')
        .then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                // Final step: Redirect user back to the starting step (Login page)
                showStep('step-email-input'); 
            }
        });
});

// --- Step 2: Auto-tabbing for code inputs (UX improvement) ---
document.querySelectorAll('.code-box').forEach((input, index, inputs) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length === e.target.maxLength && index < inputs.length - 1) {
            inputs[index + 1].focus(); // Move focus to the next input
        }
    });
});
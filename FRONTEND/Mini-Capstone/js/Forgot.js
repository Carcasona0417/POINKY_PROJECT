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
let globalEmail = "";

document.getElementById('form-email').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    globalEmail = email;

    if (!email) {
        fireAlert('error', 'Error', 'Please enter a valid email address.');
        return;
    }

    try {
        // STEP 1: Check if email exists
        const verifyRes = await fetch('http://localhost:8080/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            fireAlert('error', 'Error', 'Email does not exist.');
            return;
        }

        // STEP 2: Send OTP
        const otpRes = await fetch('http://localhost:8080/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const otpData = await otpRes.json();

        if (!otpData.success) {
            fireAlert('error', 'Error', 'Failed to send OTP.');
            return;
        }

        // STEP 3: Show your SweetAlert (UI stays the same)
        fireAlert(
            'success',
            'Email Sent!',
            `A 6-digit verification code has been sent to ${email}.`,
            'Continue'
        ).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                showStep('step-verify-code');
            }
        });

    } catch (error) {
        fireAlert('error', 'Server Error', 'Something went wrong.');
    }
});


// --- Step 2: Code Input Handler ---
document.getElementById('form-code').addEventListener('submit', async function(e) {
    e.preventDefault();
    const inputs = document.querySelectorAll('#form-code .code-box');

    let otp = "";
    inputs.forEach(input => otp += input.value);

    if (otp.length !== 6 || !/^\d+$/.test(otp)){
        fireAlert('error','Invalid Code','Please Enter 6-digit code!')
        return;
    }
    try{

        const verifyRes = await fetch('http://localhost:8080/api/auth/confirm-otp', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: globalEmail, otp: otp })
        });

        const data = await verifyRes.json();

        if(!data.success) {
            fireAlert('error', 'Invalid', data.message)
            return;
        }
        
        fireAlert('success','Code Verified!','You can now set your new password').then(() => showStep('step-new-password'));

    } catch (error){
        fireAlert('error', 'Server Error', 'Something Went Wrong' )
    };

});

// --- Step 2: Resend Code Handler ---
document.getElementById('resend-code').addEventListener('click', function(e) {
    e.preventDefault();
    fireAlert('info', 'Code Resent', 'A new verification code has been sent to your email.');
});


// --- Step 3: New Password Handler ---
document.getElementById('form-new-password').addEventListener('submit', async function(e) {
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

    try{
        const res = await fetch('http://localhost:8080/api/auth/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: globalEmail, newPassword: newPass })
        });
        
        const data = await res.json();

        if(!data.success){
            fireAlert('error','Error', data.message);
            return;
        }

        fireAlert('success', 'Password Updated!', 'Your password has been reset. Please proceed to login.')
        .then(() => showStep('step-email-input'));

    } catch(err) {
        fireAlert ('error', 'Server Error', 'Something went wrong.')
    }
});

// --- Step 2: Auto-tabbing for code inputs (UX improvement) ---
document.querySelectorAll('.code-box').forEach((input, index, inputs) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length === e.target.maxLength && index < inputs.length - 1) {
            inputs[index + 1].focus(); // Move focus to the next input
        }
    });
});
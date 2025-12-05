document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburgerMenu');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');

   
    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            if (navbar) {
                navbar.classList.toggle('active');
                
                // Toggle hamburger icon
                const hamburgerIcon = this.querySelector('i');
                if (hamburgerIcon) {
                    if (navbar.classList.contains('active')) {
                        hamburgerIcon.classList.replace('fa-bars', 'fa-times');
                    } else {
                        hamburgerIcon.classList.replace('fa-times', 'fa-bars');
                    }
                }
            }
        });
    }

    // Close mobile menu when links are clicked
    function closeMobileMenu() {
        if (navbar && navbar.classList.contains('active')) {
            navbar.classList.remove('active');
            const hamburgerIcon = document.querySelector('#hamburgerMenu i');
            if (hamburgerIcon) {
                hamburgerIcon.classList.replace('fa-times', 'fa-bars');
            }
        }
    }

    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = this.getAttribute('href');
            if (target !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(target);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                    closeMobileMenu();
                }
            }
        });
    });

    // Modal functionality - UPDATED FOR LOGIN BUTTON
    const modal = document.getElementById('loginModal');
    const triggerBtn = document.getElementById('triggerSignup');
    const triggerLoginBtn = document.getElementById('triggerLogin');
    const triggerGetStartedBtn = document.getElementById('triggerGetStarted');
    const triggerBtnBottom = document.getElementById('triggerModalBottom');
    const closeBtn = document.getElementById('closeModal');

    // Open modal from buttons - UPDATED
    if (triggerBtn) triggerBtn.addEventListener('click', () => openModal('signup'));
    if (triggerLoginBtn) triggerLoginBtn.addEventListener('click', () => openModal('login'));
    if (triggerGetStartedBtn) triggerGetStartedBtn.addEventListener('click', () => openModal('signup'));
    if (triggerBtnBottom) triggerBtnBottom.addEventListener('click', () => openModal('signup'));

    // Close modal
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (modal) {
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // Close mobile menu when clicking on auth buttons
    document.querySelectorAll('.auth-buttons .btn').forEach(button => {
        button.addEventListener('click', closeMobileMenu);
    });

    // Setup mobile form toggle event listeners
    setupMobileFormToggles();
});



// Form toggle functions
function showSignUp() {
    const signInForm = document.querySelector('.sign-in');
    const signUpForm = document.querySelector('.sign-up');
    const authContainer = document.getElementById('authContainer');
    const closeBtn = document.getElementById('closeModal');
    
    if (signInForm && signUpForm) {
        if (window.innerWidth <= 768) {
            // Mobile: Show sign-up, hide sign-in
            signInForm.style.display = 'none';
            signUpForm.style.display = 'block';
        } else if (authContainer) {
            // Desktop: Use the toggle animation
            authContainer.classList.add("active");
        }
        
        // Show close button
        if (closeBtn) closeBtn.style.display = 'flex';
        
        // Scroll to top
        if (authContainer) authContainer.scrollTop = 0;
    }
}

 // --- SweetAlert2 Configuration for consistent styling ---
   const fireAlert = (icon, title, text, timer = 1500) => {
    return Swal.fire({
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
        customClass: {
            title: 'swal2-title-custom',
            content: 'swal2-content-custom'
        }
    });
};


function showSignIn() {
    const signInForm = document.querySelector('.sign-in');
    const signUpForm = document.querySelector('.sign-up');
    const authContainer = document.getElementById('authContainer');
    const closeBtn = document.getElementById('closeModal');
    
    if (signInForm && signUpForm) {
        if (window.innerWidth <= 768) {
            // Mobile: Show sign-in, hide sign-up
            signInForm.style.display = 'block';
            signUpForm.style.display = 'none';
        } else if (authContainer) {
            // Desktop: Use the toggle animation
            authContainer.classList.remove("active");
        }
        
        // Hide close button
        if (closeBtn) closeBtn.style.display = 'none';
        
        // Scroll to top
        if (authContainer) authContainer.scrollTop = 0;
    }
}

// Setup mobile form toggle event listeners
function setupMobileFormToggles() {
    // Set up toggle links
    document.querySelectorAll('.auth-toggle-text a').forEach(link => {
        link.removeAttribute('onclick');
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.textContent.includes('Sign Up')) {
                showSignUp();
            } else {
                showSignIn();
            }
        });
    });
    
    // Set up toggle panel buttons
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    
    if (registerBtn) registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSignUp();
    });
    
    if (loginBtn) loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSignIn();
    });
}

// Open modal function - FIXED FOR INSTANT SIGN UP DISPLAY
function openModal(mode = 'signup') {
    const modal = document.getElementById('loginModal');
    const authContainer = document.getElementById('authContainer');
    const closeBtn = document.getElementById('closeModal');
    const signInForm = document.querySelector('.sign-in');
    const signUpForm = document.querySelector('.sign-up');
    
    if (modal) {
        // First, set the form state BEFORE showing the modal
        if (window.innerWidth <= 768) {
            // Mobile layout
            if (signInForm && signUpForm) {
                if (mode === 'login') {
                    signInForm.style.display = 'block';
                    signUpForm.style.display = 'none';
                    if (closeBtn) closeBtn.style.display = 'none';
                } else {
                    signInForm.style.display = 'none';
                    signUpForm.style.display = 'block';
                    if (closeBtn) closeBtn.style.display = 'flex';
                }
            }
        } else {
            // Desktop layout - set the state instantly without animation delay
            if (authContainer) {
                if (mode === 'login') {
                    authContainer.classList.remove('active');
                    if (closeBtn) closeBtn.style.display = 'none';
                } else {
                    authContainer.classList.add('active');
                    if (closeBtn) closeBtn.style.display = 'flex';
                }
            }
        }
        
        // Now show the modal with the correct form already set
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal function
function closeModal() {
    const modal = document.getElementById('loginModal');
    const closeBtn = document.getElementById('closeModal');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset close button
        if (closeBtn) closeBtn.style.display = 'none';
        
        // Reset form states
        const signInForm = document.querySelector('.sign-in');
        const signUpForm = document.querySelector('.sign-up');
        if (signInForm && signUpForm) {
            signInForm.style.display = 'block';
            signUpForm.style.display = 'block';
        }
        
        // Reset auth container
        const authContainer = document.getElementById('authContainer');
        if (authContainer) authContainer.classList.remove('active');
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    const modal = document.getElementById('loginModal');
    if (modal?.classList.contains('active')) {
        const authContainer = document.getElementById('authContainer');
        const closeBtn = document.getElementById('closeModal');
        const signInForm = document.querySelector('.sign-in');
        const signUpForm = document.querySelector('.sign-up');
        
        if (signInForm && signUpForm && closeBtn) {
            if (window.innerWidth <= 768) {
                // Mobile layout
                if (authContainer?.classList.contains('active')) {
                    signInForm.style.display = 'none';
                    signUpForm.style.display = 'block';
                    closeBtn.style.display = 'flex';
                } else {
                    signInForm.style.display = 'block';
                    signUpForm.style.display = 'none';
                    closeBtn.style.display = 'none';
                }
            } else {
                // Desktop layout
                signInForm.style.display = 'block';
                signUpForm.style.display = 'block';
                closeBtn.style.display = authContainer?.classList.contains('active') ? 'flex' : 'none';
            }
        }
    }
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = 'var(--text-color-light)';
            navbar.style.backdropFilter = 'none';
        }
    }
});


// Fetch API from backend for login
const loginForm = document.querySelector('.form-container.sign-in form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
        
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            

            localStorage.setItem("userID", data.user.UserID);
            try {
                if (data.user.Username) localStorage.setItem('username', data.user.Username);
                if (data.user.Email) localStorage.setItem('email', data.user.Email);
            } catch (err) { /* ignore storage errors */ }
           
          
           fireAlert('success','Success',data.message).then(() => {
                window.location.href = "Dashboard.html";
            });


            //closeModal();
        } else {
            fireAlert('error','Error', data.message); 
        }
    } catch (err) {
        console.error('Login error:', err);
        fireAlert('error','Error','Something went wrong. Try again.');
    }
    });
}

// fetch API from backend for register

const registerForm = document.querySelector('.form-container.sign-up form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = registerForm.querySelector('input[type="text"]').value;
    const email = registerForm.querySelector('input[type="email"]').value;
    const password = registerForm.querySelector('input[type="password"]').value;

    if (password.length < 8) {
        fireAlert('warning','Warning','Password must be at least 8 characters long.');
        return;
    }
    try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })

        });
        const data = await response.json();

        if (data.success) {
            // Modernized alert for successful registration
            fireAlert('success','Success','Registration successful! You can now log in.');
            showSignIn();
        }
    } catch (err) {
        console.error('Registration error:', err);
        fireAlert('error','Error','Something went wrong. Try again.');
    }   

    });
}

// ===============================Error Handling========================

// Form validation functions
function validateSignUpForm() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    let isValid = true;

    // Clear previous errors
    clearErrors();

    // Name validation
    if (name === '') {
        showError('nameError', 'Name is required');
        isValid = false;
    } else if (name.length < 2) {
        showError('nameError', 'Name must be at least 2 characters');
        isValid = false;
    }

    // Email validation
    if (email === '') {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Password validation
    if (password === '') {
        showError('passwordError', 'Password is required');
        isValid = false;
    } else if (password.length < 8) {
        showError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }

    if (isValid) {
        // Form is valid, you can submit it here
        fireAlert('success','Success','Sign up successful!');
        // document.getElementById('signupForm').submit(); // Uncomment to actually submit the form
    }
}

function validateSignInForm() {
    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value.trim();
    let isValid = true;

    // Clear previous errors
    clearErrors();

    // Email validation
    if (email === '') {
        showError('signinEmailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('signinEmailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Password validation
    if (password === '') {
        showError('signinPasswordError', 'Password is required');
        isValid = false;
    }

    if (isValid) {
        // Form is valid, you can submit it here
        Firealert('success','Success','Login successful!');
        // document.getElementById('signinForm').submit(); // Uncomment to actually submit the form
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add error class to the input field
    const inputId = elementId.replace('Error', '');
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
    
    // Remove error classes from all input fields
    const inputElements = document.querySelectorAll('#signupForm input, #signinForm input');
    inputElements.forEach(input => {
        input.classList.remove('error');
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form submission handlers
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    validateSignUpForm();
});

document.getElementById('signinForm').addEventListener('submit', function(e) {
    e.preventDefault();
    validateSignInForm();
});

// Real-time validation (optional - clears error when user starts typing)
document.querySelectorAll('#signupForm input, #signinForm input').forEach(input => {
    input.addEventListener('input', function() {
        const errorElement = document.getElementById(this.id + 'Error');
        if (errorElement) {
            errorElement.style.display = 'none';
            this.classList.remove('error');
        }
    });
});
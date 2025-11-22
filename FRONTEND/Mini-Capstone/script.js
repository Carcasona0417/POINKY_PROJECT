document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');

    hamburger.addEventListener('click', function() {
        navbar.classList.toggle('active'); // Toggles the 'active' class on the navbar
        // You might want to toggle specific classes for navLinks and authButtons as well
        // or rely on the 'active' class on navbar to control their display via CSS.
    });

    // Close mobile menu when a nav link is clicked
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navbar.classList.contains('active')) {
                    navbar.classList.remove('active');
                }
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Don't prevent default for links that don't point to actual sections
            const target = this.getAttribute('href');
            if (target !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(target);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Login/Signup Toggle - Fixed container reference
    const authContainer = document.getElementById('authContainer');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');

    if (registerBtn && loginBtn && authContainer) {
        registerBtn.addEventListener('click', () => {
            authContainer.classList.add("active");
        });

        loginBtn.addEventListener('click', () => {
            authContainer.classList.remove("active");
        });
    }

    // Modal functionality
    const modal = document.getElementById('loginModal');
    const triggerBtn = document.getElementById('triggerModal');
    const triggerBtnBottom = document.getElementById('triggerModalBottom');
    const closeBtn = document.getElementById('closeModal');

    // Open modal from top button
    if (triggerBtn) {
        triggerBtn.addEventListener('click', () => {
            modal.classList.add('active');
            // Reset to sign-in view when opening modal
            if (authContainer) {
                authContainer.classList.remove('active');
            }
        });
    }

    // Open modal from bottom button
    if (triggerBtnBottom) {
        triggerBtnBottom.addEventListener('click', () => {
            modal.classList.add('active');
            // Reset to sign-in view when opening modal
            if (authContainer) {
                authContainer.classList.remove('active');
            }
        });
    }

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Optional: Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });

    // Close mobile menu when clicking on auth buttons
    const authButtonElements = document.querySelectorAll('.auth-buttons .btn');
    authButtonElements.forEach(button => {
        button.addEventListener('click', () => {
            if (navbar.classList.contains('active')) {
                navbar.classList.remove('active');
            }
        });
    });
});

// Optional: Add scroll effect for navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = 'var(--text-color-light)';
        navbar.style.backdropFilter = 'none';
    }
});
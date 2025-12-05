// ProfSet.js — toggles password visibility and swaps eye / eye-slash icons
// Works with buttons that have class `toggle-password` and `data-target="<input-id>"`
// Supports FontAwesome <i> icons (toggles fa-eye / fa-eye-slash) and inline SVGs (swaps innerHTML)

document.addEventListener('DOMContentLoaded', async () => {
  const eyeSvg = `\n    <svg class="icon-eye" width="18" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="vertical-align:middle; color:currentColor;">\n      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>\n    </svg>\n  `;

  const eyeSlashSvg = `\n    <svg class="icon-eye-slash" width="18" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="vertical-align:middle; color:currentColor;">\n      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.6 19.6 0 0 1 4.11-5.08" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n      <path d="M1 1l22 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n    </svg>\n  `;

  const buttons = document.querySelectorAll('.toggle-password');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      const input = document.getElementById(targetId);
      if (!input) return;

      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';

      // Swap icon: Handle FontAwesome <i> or inline SVG
      const faIcon = btn.querySelector('i');
      if (faIcon) {
        // Toggle classes for FontAwesome: fa-eye <-> fa-eye-slash
        if (faIcon.classList.contains('fa-eye')) {
          faIcon.classList.remove('fa-eye');
          faIcon.classList.add('fa-eye-slash');
          // use solid style when slashed (if both styles loaded)
          faIcon.classList.remove('fa-regular');
          faIcon.classList.add('fa-solid');
        } else if (faIcon.classList.contains('fa-eye-slash')) {
          faIcon.classList.remove('fa-eye-slash');
          faIcon.classList.add('fa-eye');
          faIcon.classList.remove('fa-solid');
          faIcon.classList.add('fa-regular');
        } else {
          // If class wasn't present, set according to state
          if (isHidden) {
            faIcon.classList.remove('fa-eye-slash');
            faIcon.classList.add('fa-eye');
            faIcon.classList.remove('fa-solid');
            faIcon.classList.add('fa-regular');
          } else {
            faIcon.classList.remove('fa-eye');
            faIcon.classList.add('fa-eye-slash');
            faIcon.classList.remove('fa-regular');
            faIcon.classList.add('fa-solid');
          }
        }
        return;
      }

      // Handle inline SVGs: swap innerHTML of the button between eye and eyeSlash
      const svg = btn.querySelector('svg');
      if (svg) {
        btn.innerHTML = isHidden ? eyeSlashSvg : eyeSvg;
        // re-append any attributes we need (keep data-target)
        btn.setAttribute('data-target', targetId);
      }

    });
  });

  // ---- Edit Profile button behaviour ----
  const editBtn = document.getElementById('editProfileBtn');
  const usernameInput = document.getElementById('usernameInput');
  const emailInput = document.getElementById('emailInput');
  // Populate inputs from backend if possible, fallback to localStorage
  try {
    const userId = localStorage.getItem('userID');
    if (userId) {
      try {
        const resp = await fetch('http://localhost:8080/api/auth/get-profile', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        const payload = await resp.json();
        if (resp.ok && payload && payload.success && payload.user) {
          const u = payload.user;
          if (usernameInput && u.Username) usernameInput.value = u.Username;
          if (emailInput && u.Email) emailInput.value = u.Email;
          const profileUsernameEl = document.querySelector('.profile-username');
          if (profileUsernameEl && u.Username) profileUsernameEl.textContent = u.Username;
          try { if (u.Username) localStorage.setItem('username', u.Username); if (u.Email) localStorage.setItem('email', u.Email); } catch (e) {}
        } else {
          const storedUsername = localStorage.getItem('username') || localStorage.getItem('Username') || '';
          const storedEmail = localStorage.getItem('email') || localStorage.getItem('Email') || '';
          if (usernameInput && storedUsername) usernameInput.value = storedUsername;
          if (emailInput && storedEmail) emailInput.value = storedEmail;
          const profileUsernameEl = document.querySelector('.profile-username');
          if (profileUsernameEl && storedUsername) profileUsernameEl.textContent = storedUsername;
        }
      } catch (err) {
        const storedUsername = localStorage.getItem('username') || localStorage.getItem('Username') || '';
        const storedEmail = localStorage.getItem('email') || localStorage.getItem('Email') || '';
        if (usernameInput && storedUsername) usernameInput.value = storedUsername;
        if (emailInput && storedEmail) emailInput.value = storedEmail;
        const profileUsernameEl = document.querySelector('.profile-username');
        if (profileUsernameEl && storedUsername) profileUsernameEl.textContent = storedUsername;
      }
    } else {
      const storedUsername = localStorage.getItem('username') || localStorage.getItem('Username') || '';
      const storedEmail = localStorage.getItem('email') || localStorage.getItem('Email') || '';
      if (usernameInput && storedUsername) usernameInput.value = storedUsername;
      if (emailInput && storedEmail) emailInput.value = storedEmail;
      const profileUsernameEl = document.querySelector('.profile-username');
      if (profileUsernameEl && storedUsername) profileUsernameEl.textContent = storedUsername;
    }
  } catch (err) {
    console.warn('Could not read profile from localStorage or backend', err);
  }
  if (editBtn && usernameInput && emailInput) {
    editBtn.dataset.editing = 'false';
    editBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const editing = editBtn.dataset.editing === 'true';
      if (!editing) {
        // Enter edit mode
        editBtn.dataset.editing = 'true';
        editBtn.textContent = 'Save';
        usernameInput.removeAttribute('readonly');
        emailInput.removeAttribute('readonly');
        usernameInput.classList.add('editing');
        emailInput.classList.add('editing');
        usernameInput.focus();
      } else {
        // Save: send to backend
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        // Basic validation
        if (!username) {
          if (window.Swal) Swal.fire('Error', 'Username cannot be empty', 'error');
          return;
        }
        if (!email || !/^[^\@\s]+@[^\@\s]+\.[^\@\s]+$/.test(email)) {
          if (window.Swal) Swal.fire('Error', 'Please enter a valid email', 'error');
          return;
        }

        const userId = localStorage.getItem('userID');
        if (!userId) {
          if (window.Swal) Swal.fire('Error', 'No user is logged in', 'error');
          return;
        }

        try {
          const res = await fetch('http://localhost:8080/api/auth/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, username, email })
          });

          const data = await res.json();
          if (!res.ok) {
            const msg = (data && data.message) ? data.message : 'Failed to update profile';
            if (window.Swal) Swal.fire('Error', msg, 'error');
            return;
          }

          // Success: update UI
          usernameInput.setAttribute('readonly', '');
          emailInput.setAttribute('readonly', '');
          usernameInput.classList.remove('editing');
          emailInput.classList.remove('editing');
          editBtn.dataset.editing = 'false';
          editBtn.textContent = 'Edit';
          if (window.Swal) Swal.fire({ icon: 'success', title: 'Saved', text: 'Profile info updated', timer: 1400, showConfirmButton: false });

          // Optionally update cached values in localStorage
          try { localStorage.setItem('username', username); localStorage.setItem('email', email); } catch (err) { /* ignore */ }

        } catch (err) {
          console.error('Update profile failed', err);
          if (window.Swal) Swal.fire('Error', 'Failed to update profile', 'error');
        }
      }
    });
  }

  // ---- Save Password button behaviour ----
  const savePassBtn = document.getElementById('savePasswordBtn');
  if (savePassBtn) {
    savePassBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const oldPassEl = document.getElementById('oldPass');
      const newPassEl = document.getElementById('newPass');
      const confirmPassEl = document.getElementById('confirmPass');
      if (!oldPassEl || !newPassEl || !confirmPassEl) return;

      const oldPass = oldPassEl.value.trim();
      const newPass = newPassEl.value;
      const confirmPass = confirmPassEl.value;

      if (!oldPass) {
        if (window.Swal) Swal.fire('Error', 'Please enter your old password', 'error');
        return;
      }
      if (newPass.length < 6) {
        if (window.Swal) Swal.fire('Error', 'New password must be at least 6 characters', 'error');
        return;
      }
      if (newPass !== confirmPass) {
        if (window.Swal) Swal.fire('Error', 'Passwords do not match', 'error');
        return;
      }

      const userId = localStorage.getItem('userID');
      if (!userId) {
        if (window.Swal) Swal.fire('Error', 'No user is logged in', 'error');
        return;
      }

      try {
        const resp = await fetch('http://localhost:8080/api/auth/update-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, oldPassword: oldPass, newPassword: newPass })
        });
        const data = await resp.json();
        if (!resp.ok) {
          const msg = (data && data.message) ? data.message : 'Failed to update password';
          if (window.Swal) Swal.fire('Error', msg, 'error');
          return;
        }

        // Success: clear fields
        oldPassEl.value = '';
        newPassEl.value = '';
        confirmPassEl.value = '';
        if (window.Swal) Swal.fire({ icon: 'success', title: 'Password updated', text: data.message || 'Success', timer: 1400, showConfirmButton: false });
      } catch (err) {
        console.error('Password update failed', err);
        if (window.Swal) Swal.fire('Error', 'Failed to update password', 'error');
      }
    });
  }

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
            try { localStorage.removeItem('userID'); localStorage.removeItem('username'); localStorage.removeItem('email'); } catch (e) {}
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


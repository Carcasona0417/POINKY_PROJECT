document.addEventListener('DOMContentLoaded', () => {
    const TRANSITION_MS = 0; // instant navigation (no delay)

    // Target main content for transitions so sidebar stays fixed
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.transition = `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`;
        // Entrance: remove the initial 'page-enter' class immediately
        setTimeout(() => mainContent.classList.remove('page-enter'), 0);
    }

    // Attach click handlers to sidebar menu links
    const menuLinks = document.querySelectorAll('a.menu-link[href]');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || link.target === '_blank') return;
            e.preventDefault();
            // play exit transition on main content (keeps sidebar static)
            if (mainContent) mainContent.classList.add('page-exit');
            setTimeout(() => { window.location.href = href; }, TRANSITION_MS);
        });
    });

    // Remove any lingering exit class after load (safety)
    window.setTimeout(() => { if (mainContent) mainContent.classList.remove('page-exit'); }, TRANSITION_MS + 10);
});

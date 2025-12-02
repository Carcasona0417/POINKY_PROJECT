// Notification System
class NotificationManager {
    constructor() {
        this.notifications = this.loadNotifications();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderNotifications();
        this.updateBadge();
    }

    // Sample initial notifications
    getSampleNotifications() {
        return [
            {
                id: 1,
                title: "Buy Feed!",
                message: "Starter feed in Agri Market.",
                farm: "Farm 2 – Mikel",
                date: "Sept 25",
                read: false,
                type: "feed"
            },
            {
                id: 2,
                title: "Vaccine Due",
                message: "Piglets need vaccination for common diseases.",
                farm: "Farm 1 – Main",
                date: "Sept 28",
                read: false,
                type: "vaccine"
            },
            {
                id: 3,
                title: "Equipment Maintenance",
                message: "Watering system needs cleaning and maintenance.",
                farm: "Farm 2 – Mikel",
                date: "Oct 2",
                read: false,
                type: "maintenance"
            }
        ];
    }

    loadNotifications() {
        const saved = localStorage.getItem('poinky-notifications');
        if (saved) {
            return JSON.parse(saved);
        } else {
            const sampleNotifications = this.getSampleNotifications();
            this.saveNotifications(sampleNotifications);
            return sampleNotifications;
        }
    }

    saveNotifications(notifications) {
        localStorage.setItem('poinky-notifications', JSON.stringify(notifications));
    }

    setupEventListeners() {
        const icon = document.getElementById('notificationIcon');
        const modal = document.getElementById('notificationModal');

        // Toggle modal on icon click
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            modal.classList.toggle('show');
            if (modal.classList.contains('show')) {
                this.renderNotifications();
            }
        });

        // Close when clicking outside modal
        document.addEventListener('click', (e) => {
            if (!modal.contains(e.target) && !icon.contains(e.target)) {
                modal.classList.remove('show');
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('show');
            }
        });
    }

    renderNotifications() {
        const container = document.getElementById('notificationList');
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 data-id="${notification.id}"
                 ondblclick="notificationManager.toggleDelete(${notification.id})">
                <div class="notification-title">
                    <span>${notification.title}</span>
                </div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-details">
                    <span class="notification-farm">${notification.farm}</span>
                    <span class="notification-date">${notification.date}</span>
                </div>
                <button class="notification-delete" onclick="notificationManager.deleteNotification(${notification.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Add click and swipe events
        this.addNotificationEvents();
    }

    addNotificationEvents() {
        const notificationItems = document.querySelectorAll('.notification-item');
        
        notificationItems.forEach(item => {
            const id = parseInt(item.dataset.id);
            
            // Single click to mark as read
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-delete')) {
                    this.markAsRead(id);
                }
            });

            // Swipe to delete for mobile
            this.addSwipeEvents(item, id);
        });
    }

    addSwipeEvents(item, id) {
        let startX, currentX, isSwiping = false;

        item.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isSwiping = true;
            item.classList.add('swiping');
        });

        item.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (diff > 0) { // Swiping left
                item.style.transform = `translateX(-${Math.min(diff, 80)}px)`;
            }
        });

        item.addEventListener('touchend', () => {
            if (!isSwiping) return;
            isSwiping = false;
            
            const diff = startX - currentX;
            if (diff > 50) { // Swipe threshold
                item.classList.add('swipe-delete');
                setTimeout(() => {
                    this.deleteNotification(id);
                }, 300);
            } else {
                item.style.transform = '';
            }
            item.classList.remove('swiping');
        });
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications(this.notifications);
            this.renderNotifications();
            this.updateBadge();
        }
    }

    toggleDelete(id) {
        if (window.innerWidth > 768) { // Only on desktop
            const item = document.querySelector(`.notification-item[data-id="${id}"]`);
            item.classList.toggle('show-delete');
        }
    }

    deleteNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications(this.notifications);
        this.renderNotifications();
        this.updateBadge();
        this.updateRemindersCount();
    }

    updateBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notificationBadge');
        if (this.notifications.length === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'inline-block';
        }
    }

     updateRemindersCount() {
        const remindersCount = document.getElementById('remindersCount');
        const upcomingReminders = document.getElementById('upcomingReminders');
        
        if (remindersCount) {
            remindersCount.textContent = this.notifications.length;
        }
        if (upcomingReminders) {
            upcomingReminders.textContent = this.notifications.length;
        }
    }


    addNotification(title, message, farm, date, type = 'general') {
        const newNotification = {
            id: Date.now(),
            title,
            message,
            farm,
            date,
            type,
            read: false
        };
        
        this.notifications.unshift(newNotification);
        this.saveNotifications(this.notifications);
        this.renderNotifications();
        this.updateBadge();
        this.updateRemindersCount();
    }//end notif
    
}

// Initialize Notification Manager
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});
// Add analytics for other expenses breakdown farm expenses: medical, transportation, others

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


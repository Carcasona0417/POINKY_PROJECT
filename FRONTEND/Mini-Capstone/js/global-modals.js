// Global Modals Module - Handles Notification and Profile Modals across all pages
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
                read: true,
                type: "feed"
            },
            {
                id: 2,
                title: "Vaccine Due",
                message: "Piglets need vaccination for common diseases.",
                farm: "Farm 1 – Main",
                date: "Sept 28",
                read: true,
                type: "vaccine"
            },
            {
                id: 3,
                title: "Equipment Maintenance",
                message: "Watering system needs cleaning and maintenance.",
                farm: "Farm 2 – Mikel",
                date: "Oct 2",
                read: true,
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
        // Notification icon click
        const notificationIcon = document.getElementById('notificationIcon');
        if (notificationIcon) {
            notificationIcon.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Close modal button
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close modal when clicking outside
        const notificationModal = document.getElementById('notificationModal');
        if (notificationModal) {
            notificationModal.addEventListener('click', (e) => {
                if (e.target.id === 'notificationModal') {
                    this.closeModal();
                }
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal() {
        const modal = document.getElementById('notificationModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.renderNotifications();
        }
    }

    closeModal() {
        const modal = document.getElementById('notificationModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationList');
        if (!container) return;
        
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
            if (item) item.classList.toggle('show-delete');
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
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = unreadCount;
            
            if (unreadCount === 0) {
                badge.style.display = 'none';
            } else {
                badge.style.display = 'flex';
            }
        }
    }

    updateRemindersCount() {
        const remindersCount = document.getElementById('remindersCount');
        if (remindersCount) {
            remindersCount.textContent = this.notifications.length;
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
    }
}

// Global Profile Modal Manager
class ProfileModalManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Profile button click
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Close modal when clicking outside
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.addEventListener('click', (e) => {
                if (e.target.id === 'profileModal') {
                    this.closeModal();
                }
            });
        }

        // Logout button
        const logoutItem = document.querySelector('.profile-item.logout');
        if (logoutItem) {
            logoutItem.addEventListener('click', () => {
                this.logout();
            });
        }

        // Profile Settings button
        const settingsItem = document.querySelector('.profile-item:not(.logout)');
        if (settingsItem) {
            settingsItem.addEventListener('click', () => {
                // Navigate to profile settings page
                window.location.href = 'profile-settings.html';
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    logout() {
        // Clear user session
        localStorage.removeItem('userID');
        localStorage.removeItem('poinky-notifications');
        // Redirect to login page
        window.location.href = 'index.html';
    }
}

// Initialize global managers when DOM is ready
let notificationManager;
let profileModalManager;

document.addEventListener('DOMContentLoaded', () => {
    notificationManager = new NotificationManager();
    profileModalManager = new ProfileModalManager();
});

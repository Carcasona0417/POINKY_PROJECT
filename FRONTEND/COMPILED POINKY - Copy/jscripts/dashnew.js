document.addEventListener('DOMContentLoaded', function() {

    // 1️⃣ Setup the Chart Context
    const ctx = document.getElementById('chart').getContext('2d');

    // 2️⃣ Fetch Dashboard Counts
    async function fetchDashboardData() {
        const userId = localStorage.getItem('userID');

        const bodyData = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userId})
        };

        try {
            const [farmsRes, pigsRes, expensesRes, remindersRes] = await Promise.all([
                fetch('http://localhost:8080/api/dashboard/total-farms', bodyData),
                fetch('http://localhost:8080/api/dashboard/total-pigs', bodyData),
                fetch('http://localhost:8080/api/dashboard/month-expenses', bodyData),
                fetch('http://localhost:8080/api/dashboard/upcoming-reminders', bodyData)
            ]);

            const farmsData = await farmsRes.json();
            const pigsData = await pigsRes.json();
            const expensesData = await expensesRes.json();
            const remindersData = await remindersRes.json();

            document.querySelector('.stat-box:nth-child(1) span').textContent = farmsData.totalFarms;
            document.querySelector('.stat-box:nth-child(2) span').textContent = pigsData.totalPigs;
            document.querySelector('.stat-box:nth-child(3) span').textContent = '₱' + parseFloat(expensesData.monthExpenses || 0).toLocaleString();
            document.getElementById('upcomingReminders').textContent = remindersData.upcomingReminders;

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    }
    fetchDashboardData();

    // 3️⃣ Fetch Chart Data
    async function fetchChartData() {
        
        const userId = localStorage.getItem('userID');

         try {
            const res = await fetch('http://localhost:8080/api/dashboard/chart-data', {
                 method: 'POST' ,
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({userId})
                });
                
            const result = await res.json();
            const chartData = result.chartData;
            
         // Map backend data to arrays
            const incomeData = Array(12).fill(0);
            const farmExpenseData = Array(12).fill(0);
            const feedExpenseData = Array(12).fill(0);

            chartData.forEach(d => {
                const monthIndex = d.month - 1; // month 1 = index 0
                incomeData[monthIndex] = d.income || 0;
                farmExpenseData[monthIndex] = d.farm_expenses || 0;
                feedExpenseData[monthIndex] = d.feed_expenses || 0;
            });
       

            // Chart.js Data
            const data = {
                labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: '#5dd05d',
                        hoverBackgroundColor: '#7dde7d',
                        barPercentage: 0.65,
                        categoryPercentage: 0.8,
                        borderRadius: 4
                    },
                    {
                        label: 'Farm Expenses',
                        data: farmExpenseData,
                        backgroundColor: '#ffd700',
                        hoverBackgroundColor: '#ffe44d',
                        barPercentage: 0.65,
                        categoryPercentage: 0.8,
                        borderRadius: 4
                    },
                    {
                        label: 'Feed Expenses',
                        data: feedExpenseData,
                        backgroundColor: '#8b2436',
                        hoverBackgroundColor: '#a52c42',
                        barPercentage: 0.65,
                        categoryPercentage: 0.8,
                        borderRadius: 4
                    }
                ]
            };

            // Custom Chart Background Plugin
            const customChartBackground = {
                id: 'customChartBackground',
                beforeDraw: (chart) => {
                    const {ctx, chartArea: {left, top, width, height}} = chart;
                    ctx.save();
                    const gradient = ctx.createLinearGradient(0, 0, 0, height);
                    gradient.addColorStop(0, 'rgba(255, 245, 245, 0.8)');
                    gradient.addColorStop(1, 'rgba(255, 240, 245, 0.4)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(left, top, width, height);
                    ctx.restore();
                }
            };

            // Chart Configuration
            const config = {
                type: 'bar',
                data: data,
                plugins: [customChartBackground],
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            titleColor: '#333',
                            bodyColor: '#666',
                            borderColor: 'rgba(255, 107, 129, 0.3)',
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ₱${context.parsed.y.toLocaleString()}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            border: { display: false },
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: {
                                color: '#888',
                                font: { family: 'Poppins' },
                                callback: (value) => '₱' + value.toLocaleString()
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: '#666',
                                font: { family: 'Poppins', weight: '500' }
                            }
                        }
                    },
                    onClick: (e, elements) => {
                        if (elements.length > 0) {
                            const datasetIndex = elements[0].datasetIndex;
                            const index = elements[0].index;
                            const label = data.datasets[datasetIndex].label;
                            const value = data.datasets[datasetIndex].data[index];
                            const month = data.labels[index];
                            showDetailPopup(label, month, value);
                        }
                    },
                    onHover: (event, chartElement) => {
                        event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
                    }
                }
            };

            // Render Chart
            new Chart(ctx, config);

        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    }

    fetchChartData();

    // 4️⃣ Show Popup Details
    function showDetailPopup(category, month, value) {
        const existing = document.getElementById('chart-details-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = 'chart-details-popup';

        const colors = { 'Income': '#5dd05d', 'Farm Expenses': '#ffd700', 'Feed Expenses': '#8b2436' };

        popup.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 25px; border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 2000;
            border: 2px solid var(--primary-pink, #ff6b81);
            text-align: center; min-width: 280px; animation: fadeIn 0.3s;
        `;

        popup.innerHTML = `
            <h3 style="color: ${colors[category]}; margin-bottom: 5px;">${category}</h3>
            <p style="color: #888; margin-bottom: 10px; font-size: 14px;">${month}</p>
            <p style="font-size: 28px; font-weight: 700; color: #333; margin-bottom: 20px;">
                ₱${value.toLocaleString()}
            </p>
            <button id="closePopup" style="
                background: #ff6b81; color: white; border: none; 
                padding: 10px 25px; border-radius: 8px; cursor: pointer; 
                font-weight: 600; font-family: Poppins;">Close</button>
        `;

        document.body.appendChild(popup);

        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -45%); } to { opacity: 1; transform: translate(-50%, -50%); } }
        `;
        document.head.appendChild(style);

        document.getElementById('closePopup').onclick = () => popup.remove();

        document.addEventListener('click', function closeFn(e) {
            if (e.target !== popup && !popup.contains(e.target) && e.target.tagName !== 'CANVAS') {
                popup.remove();
                document.removeEventListener('click', closeFn);
            }
        }, true);
    }

}); //end of document.add list

    // ========== SIMPLE SAMPLE DATA CHART ==========
    
    // 1. Setup Sample Chart Context
    /*
    const sampleCtx = document.getElementById('sample-chart').getContext('2d');
    
    // 2. Define Sample Data for Pig Production
    const sampleData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Pig Production (kg)',
            data: [1200, 1900, 1500, 2200, 1800, 2500, 2100, 2800, 2400, 2600, 2300, 3000],
            borderColor: '#ff6b81',
            backgroundColor: 'rgba(255, 107, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };

    // 3. Custom Plugin for Sample Chart Background
    const customSampleChartBackground = {
        id: 'customSampleChartBackground',
        beforeDraw: (chart) => {
            const {ctx, chartArea: {left, top, width, height}} = chart;
            ctx.save();
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(255, 240, 245, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 245, 250, 0.3)');
            
            // Fill background
            ctx.fillStyle = gradient;
            ctx.fillRect(left, top, width, height);
            ctx.restore();
        }
    };

    // 4. Sample Chart Configuration
    const sampleConfig = {
        type: 'line',
        data: sampleData,
        plugins: [customSampleChartBackground],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#666',
                        font: {
                            family: 'Poppins',
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: 'rgba(255, 107, 129, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} kg`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    border: { display: false },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        color: '#888',
                        font: { family: 'Poppins' },
                        callback: (value) => value + ' kg'
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#666',
                        font: { family: 'Poppins', weight: '500' }
                    }
                }
            }
        }
    };

    // 5. Render Sample Chart
    new Chart(sampleCtx, sampleConfig);


*/ 

// start Notification System
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
        e.stopPropagation(); // Prevent document click closing it immediately
        const isOpen = modal.classList.toggle('show'); // Toggle show class
        modal.style.display = isOpen ? 'block' : 'none';
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        if (isOpen) this.renderNotifications();
    });

    // Close when clicking outside modal
    document.addEventListener('click', (e) => {
        if (!modal.contains(e.target) && !icon.contains(e.target)) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Optional: Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
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
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
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

        // Update the element immediately
        const item = document.querySelector(`.notification-item[data-id="${id}"]`);
        if (item) {
            item.classList.remove('unread');
            item.classList.add('read'); // text turns gray instantly
        }

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
            if (notifications.length === 0) {
                badge.style.display = 'none';
            } else {
                badge.style.display = 'inline-block';
            }

    }

    updateRemindersCount() {
        const remindersCount = document.getElementById('remindersCount');
        remindersCount.textContent = this.notifications.length;
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
const notificationManager = new NotificationManager();

// Your existing chart code

/*
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Setup the Chart Context
    const ctx = document.getElementById('chart').getContext('2d');
    
    // 2. Define Data
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Income',
                data: incomeData,
                backgroundColor: '#5dd05d',
                hoverBackgroundColor: '#7dde7d',
                barPercentage: 0.65,
                categoryPercentage: 0.8,
                borderRadius: 4
            },
            {
                label: 'Farm Expenses',
                data: farmExpenseData,
                backgroundColor: '#ffd700',
                hoverBackgroundColor: '#ffe44d',
                barPercentage: 0.65,
                categoryPercentage: 0.8,
                borderRadius: 4
            },
            {
                label: 'Feed Expenses',
                data: feedExpenseData,
                backgroundColor: '#8b2436',
                hoverBackgroundColor: '#a52c42',
                barPercentage: 0.65,
                categoryPercentage: 0.8,
                borderRadius: 4
            }
        ]
    };

    // 3. Custom Plugin for Background Area
    const customChartBackground = {
        id: 'customChartBackground',
        beforeDraw: (chart) => {
            const {ctx, chartArea: {left, top, width, height}} = chart;
            ctx.save();
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(255, 245, 245, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 240, 245, 0.4)');
            
            // Fill background (Using standard fillRect for maximum compatibility)
            ctx.fillStyle = gradient;
            ctx.fillRect(left, top, width, height);
            
            // Draw grid lines manually if needed, or let Scales handle it
            ctx.restore();
        }
    };

    // 4. Chart Configuration
    const config = {
        type: 'bar',
        data: data,
        plugins: [customChartBackground],
        options: {
            responsive: true,
            maintainAspectRatio: false, // Important for fitting container
            plugins: {
                legend: { display: false }, // Using custom HTML legend
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: 'rgba(255, 107, 129, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₱${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    border: { display: false },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        color: '#888',
                        font: { family: 'Poppins' },
                        callback: (value) => '₱' + value.toLocaleString()
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#666',
                        font: { family: 'Poppins', weight: '500' }
                    }
                }
            },
            // Click Event for Details Popup
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const datasetIndex = elements[0].datasetIndex;
                    const index = elements[0].index;
                    const label = data.datasets[datasetIndex].label;
                    const value = data.datasets[datasetIndex].data[index];
                    const month = data.labels[index];
                    
                    showDetailPopup(label, month, value);
                }
            },
            onHover: (event, chartElement) => {
                event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
            }
        }
    };

    // 5. Render Chart
    new Chart(ctx, config);

    // Helper: Show Popup Details
    function showDetailPopup(category, month, value) {
        // Remove existing popup if any
        const existing = document.getElementById('chart-details-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = 'chart-details-popup';
        
        // Colors map
        const colors = {
            'Income': '#5dd05d',
            'Farm Expenses': '#ffd700',
            'Feed Expenses': '#8b2436'
        };

        popup.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 25px; border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 2000;
            border: 2px solid var(--primary-pink, #ff6b81);
            text-align: center; min-width: 280px; animation: fadeIn 0.3s;
        `;
        
        popup.innerHTML = `
            <h3 style="color: ${colors[category]}; margin-bottom: 5px;">${category}</h3>
            <p style="color: #888; margin-bottom: 10px; font-size: 14px;">${month}</p>
            <p style="font-size: 28px; font-weight: 700; color: #333; margin-bottom: 20px;">
                ₱${value.toLocaleString()}
            </p>
            <button id="closePopup" style="
                background: #ff6b81; color: white; border: none; 
                padding: 10px 25px; border-radius: 8px; cursor: pointer; 
                font-weight: 600; font-family: Poppins;">Close</button>
        `;

        document.body.appendChild(popup);
        
        // Add style for animation
        const style = document.createElement('style');
        style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -45%); } to { opacity: 1; transform: translate(-50%, -50%); } }`;
        document.head.appendChild(style);

        document.getElementById('closePopup').onclick = () => popup.remove();
        
        // Close on background click
        document.addEventListener('click', function closeFn(e) {
            if (e.target !== popup && !popup.contains(e.target) && e.target.tagName !== 'CANVAS') {
                popup.remove();
                document.removeEventListener('click', closeFn);
            }
        }, true);
    }
});
*/

// Add analytics for other expenses breakdown farm expenses: medical, transportation, others

//pie chart
const ctx = document.getElementById("expensesChart");

new Chart(ctx, {
    type: "doughnut",
    data: {
        labels: ["Feeds", "Piglets", "Medicines", "Utilities", "Labor", "Maintenance"],
        datasets: [{
            data: [5000, 10000, 1500, 1000, 700, 2000],
            backgroundColor: [
                "#7c57ff",   // feeds
                "#ff8686",   // piglets
                "#3bc7e6",   // medicines
                "#ffb64d",   // utilities
                "#4d78ff",   // labor
                "#4cbf65"    // maintenance
            ],
            borderWidth: 0,
            cutout: "65%"
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        }
    }
});
//pie chart end


//filter bar chart 
const monthlyBtn = document.getElementById('monthlyBtn');
    const yearlyBtn = document.getElementById('yearlyBtn');

    monthlyBtn.addEventListener('click', () => {
        monthlyBtn.classList.add('active');
        yearlyBtn.classList.remove('active');
        updateChart('monthly'); // call your function to load monthly data
    });

    yearlyBtn.addEventListener('click', () => {
        yearlyBtn.classList.add('active');
        monthlyBtn.classList.remove('active');
        updateChart('yearly'); // call your function to load yearly data
    });

    function updateChart(filter) {
        // Example: replace chart data based on filter
        if(filter === 'monthly') {
            chart.data.labels = ["Jan","Feb","Mar","Apr","May"];
            chart.data.datasets[0].data = [5000,6000,5500,7000,6500];
            chart.data.datasets[1].data = [2000,2500,2300,3000,2800];
            chart.data.datasets[2].data = [1000,1200,1100,1300,1250];
        } else if(filter === 'yearly') {
            chart.data.labels = ["2021","2022","2023","2024"];
            chart.data.datasets[0].data = [65000,70000,72000,75000];
            chart.data.datasets[1].data = [25000,26000,27000,28000];
            chart.data.datasets[2].data = [12000,13000,12500,14000];
        }
        chart.update();
    }
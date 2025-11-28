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

            chartData.forEach(d => {
                const monthIndex = d.month - 1; // month 1 = index 0
                incomeData[monthIndex] = d.income || 0;
                farmExpenseData[monthIndex] = d.farm_expenses || 0;
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

// Add analytics for other expenses breakdown farm expenses: medical, transportation, others

//pie chart
const ctx = document.getElementById("expensesChart");

new Chart(ctx, {
    type: "doughnut",
    data: {
        labels: ["Piglets", "Medicines", "Utilities", "Labor", "Maintenance"],
        datasets: [{
            data: [10000, 1500, 1000, 700, 2000],
            backgroundColor: [
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

if (monthlyBtn && yearlyBtn) {
    monthlyBtn.addEventListener('click', () => {
        monthlyBtn.classList.add('active');
        yearlyBtn.classList.remove('active');
        updateChart('monthly');
    });

    yearlyBtn.addEventListener('click', () => {
        yearlyBtn.classList.add('active');
        monthlyBtn.classList.remove('active');
        updateChart('yearly');
    });
}

function updateChart(filter) {
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
});
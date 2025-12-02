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
            
            // Map backend data to arrays (Income + Farm Expenses only)
            const incomeData = Array(12).fill(0);
            const farmExpenseData = Array(12).fill(0);

            chartData.forEach(d => {
                const monthIndex = d.month - 1; // month 1 = index 0
                incomeData[monthIndex] = d.income || 0;
                // feed expenses are considered part of farm expenses in this view
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
                    // Feed expenses are aggregated under Farm Expenses and not shown separately
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

        const colors = { 'Income': '#5dd05d', 'Farm Expenses': '#ffd700' };

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


//pie chart
async function breakdown_Expenses() {
    

const ctx = document.getElementById("expensesChart");

const userId = localStorage.getItem('userID');

         try {
            const res = await fetch('http://localhost:8080/api/dashboard/pie-chart', {
                 method: 'POST' ,
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({userId})
                });
                
            const response = await res.json();
            const data = response.data;
            
            const total = Object.values(data).reduce((sum, val) => sum + Number(val), 0);
            document.querySelector('.center-label').textContent = `₱ ${total.toLocaleString()}`;


                new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels: ["Feeds", "Piglets", "Medical", "Utilities", "Labor", "Maintenance"],
                        datasets: [{
                            data: [
                            data.feed,
                            data.piglets,
                            data.medical,
                            data.utilities,
                            data.labor,
                            data.maintenance

                            ],
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
            } catch (error) {
            console.error('Error fetching Pie Chart:', error);
        }

}
breakdown_Expenses();
//pie chart end

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

// ProfSet.js — toggles password visibility and swaps eye / eye-slash icons
// Works with buttons that have class `toggle-password` and `data-target="<input-id>"`
// Supports FontAwesome <i> icons (toggles fa-eye / fa-eye-slash) and inline SVGs (swaps innerHTML)

document.addEventListener('DOMContentLoaded', () => {
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
  if (editBtn && usernameInput && emailInput) {
    editBtn.dataset.editing = 'false';
    editBtn.addEventListener('click', (e) => {
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
        // Save (client-side only)
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

        // Simulate save
        usernameInput.setAttribute('readonly', '');
        emailInput.setAttribute('readonly', '');
        usernameInput.classList.remove('editing');
        emailInput.classList.remove('editing');
        editBtn.dataset.editing = 'false';
        editBtn.textContent = 'Edit';
        if (window.Swal) Swal.fire({ icon: 'success', title: 'Saved', text: 'Profile info updated', timer: 1400, showConfirmButton: false });
      }
    });
  }

  // ---- Save Password button behaviour ----
  const savePassBtn = document.getElementById('savePasswordBtn');
  if (savePassBtn) {
    savePassBtn.addEventListener('click', (e) => {
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

      // Simulate password change
      oldPassEl.value = '';
      newPassEl.value = '';
      confirmPassEl.value = '';
      if (window.Swal) Swal.fire({ icon: 'success', title: 'Password updated', timer: 1400, showConfirmButton: false });
    });
  }

});


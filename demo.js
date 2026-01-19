// =====================================================
// PARKING MANAGEMENT SYSTEM - DEMO VERSION
// Uses local storage instead of Supabase for demonstration
// =====================================================

// Demo configuration
const CONFIG = {
    parking: {
        totalSpaces: 50,
        carSpaces: 35,
        motoSpaces: 15
    },
    pricing: {
        carHourlyRate: 2500,
        motoHourlyRate: 1500,
        carDayRate: 20000,
        motoDayRate: 12000,
        carMonthRate: 400000,
        motoMonthRate: 250000
    },
    alerts: {
        warningMinutes: 60,
        overdueColor: '#e74c3c',
        warningColor: '#e67e22'
    },
    refresh: {
        dashboardInterval: 30000
    }
};

// ===== LOCAL STORAGE DATABASE =====
const DB = {
    getTickets: function () {
        const tickets = localStorage.getItem('demo_tickets');
        return tickets ? JSON.parse(tickets) : this.getInitialData();
    },

    saveTickets: function (tickets) {
        localStorage.setItem('demo_tickets', JSON.stringify(tickets));
    },

    addTicket: function (ticket) {
        const tickets = this.getTickets();
        ticket.id = this.generateId();
        ticket.created_at = new Date().toISOString();
        ticket.updated_at = new Date().toISOString();
        tickets.push(ticket);
        this.saveTickets(tickets);
        return ticket;
    },

    updateTicket: function (id, updates) {
        const tickets = this.getTickets();
        const index = tickets.findIndex(t => t.id === id);
        if (index !== -1) {
            tickets[index] = { ...tickets[index], ...updates, updated_at: new Date().toISOString() };
            this.saveTickets(tickets);
            return tickets[index];
        }
        return null;
    },

    generateId: function () {
        return 'ticket_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    getInitialData: function () {
        const now = new Date();

        // Create sample tickets with different states
        const tickets = [
            {
                id: 'demo_1',
                placa: 'ABC123',
                nombre_cliente: 'Juan Pérez',
                celular: '3001234567',
                tipo_vehiculo: 'carro',
                puesto: 'A-01',
                fecha_ingreso: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
                fecha_salida_estimada: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
                estado_pago: false,
                total: 5000,
                created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'demo_2',
                placa: 'XYZ789',
                nombre_cliente: 'María García',
                celular: '3009876543',
                tipo_vehiculo: 'moto',
                puesto: 'B-05',
                fecha_ingreso: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                fecha_salida_estimada: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutes from now (WARNING)
                estado_pago: false,
                total: 2000,
                created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'demo_3',
                placa: 'DEF456',
                nombre_cliente: 'Carlos López',
                celular: '3005551234',
                tipo_vehiculo: 'carro',
                puesto: 'A-10',
                fecha_ingreso: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
                fecha_salida_estimada: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago (DANGER)
                estado_pago: false,
                total: 8000,
                created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'demo_4',
                placa: 'GHI789',
                nombre_cliente: 'Ana Martínez',
                celular: '3007778888',
                tipo_vehiculo: 'carro',
                puesto: 'A-15',
                fecha_ingreso: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
                fecha_salida_estimada: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
                estado_pago: true, // Already paid
                total: 6000,
                created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'demo_5',
                placa: 'JKL012',
                nombre_cliente: 'Pedro Ramírez',
                celular: '3003334444',
                tipo_vehiculo: 'moto',
                puesto: 'B-08',
                fecha_ingreso: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
                fecha_salida_estimada: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                estado_pago: true, // Already paid
                total: 3000,
                created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
            }
        ];

        this.saveTickets(tickets);
        return tickets;
    }
};

// ===== STATE MANAGEMENT =====
let currentView = 'dashboard';
let dashboardInterval = null;
let allTickets = [];
let isAdminAuthenticated = sessionStorage.getItem('admin_session') === 'active'; // Persist session across views

// ===== THEME MANAGEMENT =====
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme, false); // false = don't animate on initial load

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
}

function setTheme(theme, animate = true) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    localStorage.setItem('theme', theme);

    // Add transition class for smooth color changes
    if (animate) {
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme(); // Initialize theme first
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupRegistrationForm();
    setupReportsFilters();
    setupAdminPanel();
    setupAdminAuth(); // Initialize authentication
    setDefaultDates();
    loadDashboard();
    startDashboardRefresh();
}

// ===== NAVIGATION =====
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewName = btn.dataset.view;
            switchView(viewName);

            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchView(viewName) {
    // Check authentication before showing admin panel
    if (viewName === 'admin' && !isAdminAuthenticated) {
        checkAdminAuth();
        return; // Don't switch view yet, wait for auth
    }

    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(viewName);
    if (targetView) {
        targetView.classList.add('active');
        currentView = viewName;

        if (viewName === 'dashboard') {
            loadDashboard();
            startDashboardRefresh();
        } else if (viewName === 'reportes') {
            loadReports();
            stopDashboardRefresh();
        } else if (viewName === 'admin') {
            loadAdminPanel();
            stopDashboardRefresh();
        } else {
            stopDashboardRefresh();
        }
    }
}

// ===== DASHBOARD =====
function loadDashboard() {
    const tickets = DB.getTickets();
    const activeTickets = tickets.filter(t => !t.estado_pago);

    updateStatistics(activeTickets, tickets);
    renderActiveTickets(activeTickets);
}

function updateStatistics(activeTickets, allTickets) {
    // Current vehicles
    const currentVehicles = activeTickets.length;
    document.getElementById('stat-current').textContent = currentVehicles;

    // Free spaces
    const freeSpaces = CONFIG.parking.totalSpaces - currentVehicles;
    document.getElementById('stat-free').textContent = freeSpaces;

    // Daily revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paidToday = allTickets.filter(t => {
        const ingresoDate = new Date(t.fecha_ingreso);
        return t.estado_pago && ingresoDate >= today;
    });

    const revenue = paidToday.reduce((sum, ticket) => sum + parseFloat(ticket.total), 0);
    document.getElementById('stat-revenue').textContent = formatCurrency(revenue);
}

function renderActiveTickets(tickets) {
    const container = document.getElementById('active-tickets');

    if (tickets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🅿️</div>
                <div class="empty-state-text">No hay vehículos en el parqueadero</div>
            </div>
        `;
        return;
    }

    container.innerHTML = tickets.map(ticket => {
        const alertClass = getAlertClass(ticket.fecha_salida_estimada);
        const alertIcon = alertClass === 'danger' ? '🔴' : alertClass === 'warning' ? '🟠' : '🟢';

        return `
            <div class="ticket-item ${alertClass}">
                <div class="ticket-header">
                    <div class="ticket-plate">${alertIcon} ${ticket.placa}</div>
                    <span class="ticket-badge ${ticket.tipo_vehiculo}">${ticket.tipo_vehiculo}</span>
                </div>
                
                <div class="ticket-info">
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Cliente:</span>
                        <span class="ticket-info-value">${ticket.nombre_cliente}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Celular:</span>
                        <span class="ticket-info-value">${ticket.celular}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Puesto:</span>
                        <span class="ticket-info-value">${ticket.puesto}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Ingreso:</span>
                        <span class="ticket-info-value">${formatDateTime(ticket.fecha_ingreso)}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Salida Estimada:</span>
                        <span class="ticket-info-value">${formatDateTime(ticket.fecha_salida_estimada)}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Total:</span>
                        <span class="ticket-info-value">${formatCurrency(ticket.total)}</span>
                    </div>
                </div>
                
                <div class="ticket-actions">
                    <button class="btn btn-success" onclick="markAsPaid('${ticket.id}')">
                        ✅ Marcar como Pagado
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getAlertClass(fechaSalida) {
    const now = new Date();
    const exitTime = new Date(fechaSalida);
    const diffMinutes = (exitTime - now) / (1000 * 60);

    if (diffMinutes < 0) {
        return 'danger';
    } else if (diffMinutes < CONFIG.alerts.warningMinutes) {
        return 'warning';
    }
    return '';
}

function markAsPaid(ticketId) {
    // No confirmation dialog - direct action for better UX
    DB.updateTicket(ticketId, { estado_pago: true });
    showSuccessMessage('✅ Ticket marcado como pagado exitosamente');
    loadDashboard();
}

function startDashboardRefresh() {
    stopDashboardRefresh();
    dashboardInterval = setInterval(() => {
        if (currentView === 'dashboard') {
            loadDashboard();
        }
    }, CONFIG.refresh.dashboardInterval);
}

function stopDashboardRefresh() {
    if (dashboardInterval) {
        clearInterval(dashboardInterval);
        dashboardInterval = null;
    }
}

// ===== REGISTRATION FORM =====
function calculateTotal() {
    // Get selected vehicle type
    const vehicleType = document.querySelector('input[name="tipo_vehiculo"]:checked')?.value;
    // Get selected rate type
    const rateType = document.querySelector('input[name="rate_type"]:checked')?.value;

    if (!vehicleType || !rateType) {
        document.getElementById('total').value = '';
        return;
    }

    let total = 0;

    // Calculate based on vehicle and rate type
    if (vehicleType === 'carro') {
        if (rateType === 'hour') {
            total = CONFIG.pricing.carHourlyRate;
        } else if (rateType === 'day') {
            total = CONFIG.pricing.carDayRate;
        } else if (rateType === 'month') {
            total = CONFIG.pricing.carMonthRate;
        }
    } else if (vehicleType === 'moto') {
        if (rateType === 'hour') {
            total = CONFIG.pricing.motoHourlyRate;
        } else if (rateType === 'day') {
            total = CONFIG.pricing.motoDayRate;
        } else if (rateType === 'month') {
            total = CONFIG.pricing.motoMonthRate;
        }
    }

    document.getElementById('total').value = total;
}

function setupRegistrationForm() {
    const form = document.getElementById('registro-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        handleRegistration();
    });

    // Add event listeners for automatic total calculation
    const vehicleRadios = document.querySelectorAll('input[name="tipo_vehiculo"]');
    const rateRadios = document.querySelectorAll('input[name="rate_type"]');

    vehicleRadios.forEach(radio => {
        radio.addEventListener('change', calculateTotal);
    });

    rateRadios.forEach(radio => {
        radio.addEventListener('change', calculateTotal);
    });

    // Calculate initial total
    calculateTotal();
}

function setDefaultDates() {
    const now = new Date();
    const nowString = now.toISOString().slice(0, 16);
    document.getElementById('fecha-ingreso').value = nowString;

    const exitTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const exitString = exitTime.toISOString().slice(0, 16);
    document.getElementById('fecha-salida').value = exitString;
}

function handleRegistration() {
    const messageContainer = document.getElementById('registro-message');
    messageContainer.innerHTML = '';

    try {
        const rateType = document.querySelector('input[name="rate_type"]:checked').value;
        const total = parseFloat(document.getElementById('total').value);

        const formData = {
            placa: document.getElementById('placa').value.trim().toUpperCase(),
            nombre_cliente: document.getElementById('nombre').value.trim(),
            celular: document.getElementById('celular').value.trim(),
            tipo_vehiculo: document.querySelector('input[name="tipo_vehiculo"]:checked').value,
            puesto: document.getElementById('puesto').value.trim().toUpperCase(),
            fecha_ingreso: new Date(document.getElementById('fecha-ingreso').value).toISOString(),
            fecha_salida_estimada: new Date(document.getElementById('fecha-salida').value).toISOString(),
            total: total,
            rate_type: rateType, // hour, day, or month
            rate_amount: total, // store the actual rate applied
            estado_pago: false
        };

        DB.addTicket(formData);

        messageContainer.innerHTML = `
            <div class="alert alert-success">
                ✅ Vehículo registrado exitosamente - Placa: ${formData.placa}
            </div>
        `;

        document.getElementById('registro-form').reset();
        setDefaultDates();

        messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, 5000);

    } catch (error) {
        console.error('Error registering vehicle:', error);
        messageContainer.innerHTML = `
            <div class="alert alert-danger">
                ❌ Error al registrar vehículo: ${error.message}
            </div>
        `;
    }
}

// ===== REPORTS =====
function setupReportsFilters() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    document.getElementById('filter-desde').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('filter-hasta').value = today.toISOString().split('T')[0];

    document.getElementById('btn-aplicar-filtros').addEventListener('click', loadReports);
    document.getElementById('btn-exportar-pdf').addEventListener('click', exportToPDF);
}

function loadReports() {
    const desde = document.getElementById('filter-desde').value;
    const hasta = document.getElementById('filter-hasta').value;
    const estado = document.getElementById('filter-estado').value;

    let tickets = DB.getTickets();

    // Apply filters
    if (desde) {
        const desdeDate = new Date(desde + 'T00:00:00');
        tickets = tickets.filter(t => new Date(t.fecha_ingreso) >= desdeDate);
    }
    if (hasta) {
        const hastaDate = new Date(hasta + 'T23:59:59');
        tickets = tickets.filter(t => new Date(t.fecha_ingreso) <= hastaDate);
    }
    if (estado === 'pagado') {
        tickets = tickets.filter(t => t.estado_pago);
    } else if (estado === 'pendiente') {
        tickets = tickets.filter(t => !t.estado_pago);
    }

    allTickets = tickets;
    renderReportsTable(tickets);
    renderReportSummary(tickets);
}

function renderReportsTable(tickets) {
    const tbody = document.getElementById('reportes-tbody');

    if (tickets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <div class="empty-state-icon">📊</div>
                        <div class="empty-state-text">No se encontraron registros</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = tickets.map(ticket => `
        <tr>
            <td><strong>${ticket.placa}</strong></td>
            <td>${ticket.nombre_cliente}</td>
            <td><span class="ticket-badge ${ticket.tipo_vehiculo}">${ticket.tipo_vehiculo}</span></td>
            <td>${ticket.puesto}</td>
            <td>${formatDateTime(ticket.fecha_ingreso)}</td>
            <td>${formatDateTime(ticket.fecha_salida_estimada)}</td>
            <td><strong>${formatCurrency(ticket.total)}</strong></td>
            <td>${ticket.estado_pago ? '<span style="color: var(--color-success)">✅ Pagado</span>' : '<span style="color: var(--color-danger)">⏳ Pendiente</span>'}</td>
        </tr>
    `).join('');
}

function renderReportSummary(tickets) {
    const container = document.getElementById('report-summary');

    const totalTickets = tickets.length;
    const paidTickets = tickets.filter(t => t.estado_pago).length;
    const pendingTickets = totalTickets - paidTickets;
    const totalRevenue = tickets.filter(t => t.estado_pago).reduce((sum, t) => sum + parseFloat(t.total), 0);
    const pendingRevenue = tickets.filter(t => !t.estado_pago).reduce((sum, t) => sum + parseFloat(t.total), 0);

    container.innerHTML = `
        <div class="card">
            <h3 style="margin-bottom: 1rem; color: var(--color-dark-gray);">Resumen del Período</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Tickets</div>
                    <div class="stat-value">${totalTickets}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Pagados</div>
                    <div class="stat-value">${paidTickets}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Pendientes</div>
                    <div class="stat-value">${pendingTickets}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Recaudo Total</div>
                    <div class="stat-value">${formatCurrency(totalRevenue)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Por Cobrar</div>
                    <div class="stat-value">${formatCurrency(pendingRevenue)}</div>
                </div>
            </div>
        </div>
    `;
}

function exportToPDF() {
    if (allTickets.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const printWindow = window.open('', '_blank');
    const desde = document.getElementById('filter-desde').value;
    const hasta = document.getElementById('filter-hasta').value;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte de Parqueadero</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #2d3436; }
                h1 { color: #0984e3; border-bottom: 3px solid #0984e3; padding-bottom: 10px; }
                .info { margin: 20px 0; padding: 10px; background-color: #f5f6fa; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #2d3436; color: white; padding: 12px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #dfe6e9; }
                tr:nth-child(even) { background-color: #f5f6fa; }
                .summary { margin-top: 30px; padding: 15px; background-color: #0984e3; color: white; border-radius: 5px; }
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <h1>🅿️ Reporte de Parqueadero</h1>
            <div class="info">
                <p><strong>Período:</strong> ${formatDate(desde)} - ${formatDate(hasta)}</p>
                <p><strong>Fecha de generación:</strong> ${formatDateTime(new Date().toISOString())}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Placa</th><th>Cliente</th><th>Tipo</th><th>Puesto</th>
                        <th>Ingreso</th><th>Total</th><th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${allTickets.map(ticket => `
                        <tr>
                            <td><strong>${ticket.placa}</strong></td>
                            <td>${ticket.nombre_cliente}</td>
                            <td>${ticket.tipo_vehiculo}</td>
                            <td>${ticket.puesto}</td>
                            <td>${formatDateTime(ticket.fecha_ingreso)}</td>
                            <td>${formatCurrency(ticket.total)}</td>
                            <td>${ticket.estado_pago ? 'Pagado' : 'Pendiente'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="summary">
                <h3>Resumen</h3>
                <p><strong>Total de tickets:</strong> ${allTickets.length}</p>
                <p><strong>Tickets pagados:</strong> ${allTickets.filter(t => t.estado_pago).length}</p>
                <p><strong>Recaudo total:</strong> ${formatCurrency(allTickets.filter(t => t.estado_pago).reduce((sum, t) => sum + parseFloat(t.total), 0))}</p>
            </div>
            <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background-color: #0984e3; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                🖨️ Imprimir / Guardar como PDF
            </button>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
}

// ===== UTILITY FUNCTIONS =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ===== ADMIN PANEL =====
function setupAdminPanel() {
    // Save configuration button
    document.getElementById('btn-save-config').addEventListener('click', saveAdminConfig);

    // Reset demo data button
    document.getElementById('btn-reset-demo').addEventListener('click', resetDemoData);

    // Clear all tickets button
    document.getElementById('btn-clear-all').addEventListener('click', clearAllTickets);

    // Load current config
    loadAdminConfig();
}

function loadAdminConfig() {
    document.getElementById('admin-total-spaces').value = CONFIG.parking.totalSpaces;
    document.getElementById('admin-car-rate').value = CONFIG.pricing.carHourlyRate;
    document.getElementById('admin-moto-rate').value = CONFIG.pricing.motoHourlyRate;
    document.getElementById('admin-car-day-rate').value = CONFIG.pricing.carDayRate;
    document.getElementById('admin-moto-day-rate').value = CONFIG.pricing.motoDayRate;
    document.getElementById('admin-car-month-rate').value = CONFIG.pricing.carMonthRate;
    document.getElementById('admin-moto-month-rate').value = CONFIG.pricing.motoMonthRate;
    document.getElementById('admin-warning-minutes').value = CONFIG.alerts.warningMinutes;
}

function saveAdminConfig() {
    const totalSpaces = parseInt(document.getElementById('admin-total-spaces').value);
    const carRate = parseInt(document.getElementById('admin-car-rate').value);
    const motoRate = parseInt(document.getElementById('admin-moto-rate').value);
    const carDayRate = parseInt(document.getElementById('admin-car-day-rate').value);
    const motoDayRate = parseInt(document.getElementById('admin-moto-day-rate').value);
    const carMonthRate = parseInt(document.getElementById('admin-car-month-rate').value);
    const motoMonthRate = parseInt(document.getElementById('admin-moto-month-rate').value);
    const warningMinutes = parseInt(document.getElementById('admin-warning-minutes').value);

    // Update CONFIG object
    CONFIG.parking.totalSpaces = totalSpaces;
    CONFIG.pricing.carHourlyRate = carRate;
    CONFIG.pricing.motoHourlyRate = motoRate;
    CONFIG.pricing.carDayRate = carDayRate;
    CONFIG.pricing.motoDayRate = motoDayRate;
    CONFIG.pricing.carMonthRate = carMonthRate;
    CONFIG.pricing.motoMonthRate = motoMonthRate;
    CONFIG.alerts.warningMinutes = warningMinutes;

    // Save to localStorage
    localStorage.setItem('admin_config', JSON.stringify(CONFIG));

    showSuccessMessage('💾 Configuración guardada exitosamente');

    // Reload dashboard to reflect changes
    if (currentView === 'dashboard') {
        loadDashboard();
    }
}

function resetDemoData() {
    // Clear existing data
    localStorage.removeItem('demo_tickets');

    // Reload initial data
    DB.getInitialData();

    showSuccessMessage('🔄 Datos de demostración restaurados');

    // Reload current view
    loadAdminPanel();
}

function clearAllTickets() {
    localStorage.setItem('demo_tickets', JSON.stringify([]));
    showSuccessMessage('🗑️ Todos los tickets eliminados');
    loadAdminPanel();
}

function loadAdminPanel() {
    loadAdminConfig();
    renderAdminStats();
}

function renderAdminStats() {
    const container = document.getElementById('admin-stats');
    const tickets = DB.getTickets();

    const totalTickets = tickets.length;
    const activeTickets = tickets.filter(t => !t.estado_pago).length;
    const paidTickets = tickets.filter(t => t.estado_pago).length;
    const totalRevenue = tickets.filter(t => t.estado_pago).reduce((sum, t) => sum + parseFloat(t.total), 0);
    const pendingRevenue = tickets.filter(t => !t.estado_pago).reduce((sum, t) => sum + parseFloat(t.total), 0);
    const carTickets = tickets.filter(t => t.tipo_vehiculo === 'carro').length;
    const motoTickets = tickets.filter(t => t.tipo_vehiculo === 'moto').length;

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Tickets</div>
                <div class="stat-value">${totalTickets}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Tickets Activos</div>
                <div class="stat-value">${activeTickets}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Tickets Pagados</div>
                <div class="stat-value">${paidTickets}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Recaudo Total</div>
                <div class="stat-value">${formatCurrency(totalRevenue)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Por Cobrar</div>
                <div class="stat-value">${formatCurrency(pendingRevenue)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Carros</div>
                <div class="stat-value">${carTickets}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Motos</div>
                <div class="stat-value">${motoTickets}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Capacidad</div>
                <div class="stat-value">${CONFIG.parking.totalSpaces}</div>
            </div>
        </div>
    `;
}

// =====================================================
// ADMIN AUTHENTICATION SYSTEM
// =====================================================

// ===== PASSWORD HASHING =====
function hashPassword(password) {
    // Simple Base64 encoding for demo purposes
    // In production, use proper hashing like bcrypt
    return btoa(password + '_salt_demo_2026');
}

function verifyPassword(password, hashedPassword) {
    return hashPassword(password) === hashedPassword;
}

// ===== CREDENTIAL MANAGEMENT =====
function getAdminCredentials() {
    const creds = localStorage.getItem('admin_credentials');
    return creds ? JSON.parse(creds) : null;
}

function saveAdminCredentials(email, password) {
    const credentials = {
        email: email.toLowerCase().trim(),
        password: hashPassword(password),
        created_at: new Date().toISOString()
    };
    localStorage.setItem('admin_credentials', JSON.stringify(credentials));
}

// ===== AUTHENTICATION SETUP =====
function setupAdminAuth() {
    // Setup form handlers
    document.getElementById('setup-credentials-form').addEventListener('submit', handleSetupSubmit);
    document.getElementById('login-credentials-form').addEventListener('submit', handleLoginSubmit);
    document.getElementById('btn-change-password').addEventListener('click', handlePasswordChange);
    document.getElementById('btn-logout-admin').addEventListener('click', handleLogout);
}

function checkAdminAuth() {
    const credentials = getAdminCredentials();

    if (!credentials) {
        // First time - show setup form
        showAdminSetup();
    } else {
        // Credentials exist - show login form
        showAdminLogin();
    }
}

function showAdminSetup() {
    const modal = document.getElementById('admin-auth-modal');
    const setupForm = document.getElementById('admin-setup-form');
    const loginForm = document.getElementById('admin-login-form');

    loginForm.style.display = 'none';
    setupForm.style.display = 'block';
    modal.style.display = 'flex';

    // Clear form
    document.getElementById('setup-credentials-form').reset();
    document.getElementById('setup-message').innerHTML = '';
}

function showAdminLogin() {
    const modal = document.getElementById('admin-auth-modal');
    const setupForm = document.getElementById('admin-setup-form');
    const loginForm = document.getElementById('admin-login-form');

    setupForm.style.display = 'none';
    loginForm.style.display = 'block';
    modal.style.display = 'flex';

    // Clear form
    document.getElementById('login-credentials-form').reset();
    document.getElementById('login-message').innerHTML = '';
}

function hideAuthModal() {
    document.getElementById('admin-auth-modal').style.display = 'none';
}

// ===== FORM HANDLERS =====
function handleSetupSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('setup-email').value.trim();
    const password = document.getElementById('setup-password').value;
    const passwordConfirm = document.getElementById('setup-password-confirm').value;
    const messageContainer = document.getElementById('setup-message');

    // Validate
    if (password.length < 6) {
        messageContainer.innerHTML = '<div class="alert alert-danger">❌ La contraseña debe tener al menos 6 caracteres</div>';
        return;
    }

    if (password !== passwordConfirm) {
        messageContainer.innerHTML = '<div class="alert alert-danger">❌ Las contraseñas no coinciden</div>';
        return;
    }

    // Save credentials
    saveAdminCredentials(email, password);

    // Show success and grant access
    messageContainer.innerHTML = '<div class="alert alert-success">✅ Credenciales establecidas exitosamente</div>';

    setTimeout(() => {
        isAdminAuthenticated = true;
        sessionStorage.setItem('admin_session', 'active'); // Save session
        hideAuthModal();
        switchView('admin');
    }, 1000);
}

function handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const messageContainer = document.getElementById('login-message');

    const credentials = getAdminCredentials();

    // Validate
    if (email.toLowerCase() !== credentials.email) {
        messageContainer.innerHTML = '<div class="alert alert-danger">❌ Correo incorrecto</div>';
        return;
    }

    if (!verifyPassword(password, credentials.password)) {
        messageContainer.innerHTML = '<div class="alert alert-danger">❌ Contraseña incorrecta</div>';
        return;
    }

    // Success
    messageContainer.innerHTML = '<div class="alert alert-success">✅ Acceso concedido</div>';

    setTimeout(() => {
        isAdminAuthenticated = true;
        sessionStorage.setItem('admin_session', 'active'); // Save session
        hideAuthModal();
        switchView('admin');
    }, 800);
}

function handlePasswordChange() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const newPasswordConfirm = document.getElementById('new-password-confirm').value;

    // Validate inputs
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
        showSuccessMessage('❌ Por favor completa todos los campos');
        return;
    }

    if (newPassword.length < 6) {
        showSuccessMessage('❌ La nueva contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (newPassword !== newPasswordConfirm) {
        showSuccessMessage('❌ Las nuevas contraseñas no coinciden');
        return;
    }

    const credentials = getAdminCredentials();

    // Verify current password
    if (!verifyPassword(currentPassword, credentials.password)) {
        showSuccessMessage('❌ Contraseña actual incorrecta');
        return;
    }

    // Update password
    saveAdminCredentials(credentials.email, newPassword);

    // Clear fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('new-password-confirm').value = '';

    showSuccessMessage('🔑 Contraseña actualizada exitosamente');
}

function handleLogout() {
    isAdminAuthenticated = false;
    sessionStorage.removeItem('admin_session'); // Clear session
    showSuccessMessage('🚪 Sesión cerrada');
    switchView('dashboard');
}

// Make markAsPaid globally available
window.markAsPaid = markAsPaid;

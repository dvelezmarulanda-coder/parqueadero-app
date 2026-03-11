// =====================================================
// PARKING MANAGEMENT SYSTEM - CONSOLIDATED APP
// =====================================================

console.log('🚀 app.js execution started');

// ===== 1. CONFIGURATION =====
// Config is now loaded from config.js
if (!window.CONFIG) {
    console.error('❌ CRITICAL: config.js not loaded!');
    alert('Error crítico: Archivo de configuración no encontrado.');
}

// ===== 2. AUTHENTICATION HELPERS (Formerly auth.js) =====
// Simple Base64 encoding for demo purposes
window.hashPassword = (password) => btoa(password + '_salt_demo_2026');
window.verifyPassword = (password, hashedPassword) => window.hashPassword(password) === hashedPassword;

window.getAdminCredentials = () => {
    try {
        const creds = localStorage.getItem('admin_credentials');
        return creds ? JSON.parse(creds) : null;
    } catch (e) {
        console.error('Error reading admin creds:', e);
        return null;
    }
};

window.saveAdminCredentials = (email, password) => {
    const credentials = {
        email: email.toLowerCase().trim(),
        password: window.hashPassword(password),
        created_at: new Date().toISOString()
    };
    localStorage.setItem('admin_credentials', JSON.stringify(credentials));
};

let isAdminAuthenticated = false;

window.setupAdminAuth = () => {
    console.log('🔐 Setting up Admin Auth');
    const setupForm = document.getElementById('setup-credentials-form');
    const loginForm = document.getElementById('login-credentials-form');
    const changeBtn = document.getElementById('btn-change-password');
    const logoutBtn = document.getElementById('btn-logout-admin');

    if (setupForm) {
        setupForm.onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('setup-email').value;
            const pass = document.getElementById('setup-password').value;
            window.saveAdminCredentials(email, pass);
            isAdminAuthenticated = true;
            document.getElementById('admin-auth-modal').style.display = 'none';
            switchView('admin');
            showSuccessMessage('Admin configurado exitosamente');
        };
    }

    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.toLowerCase().trim();
            const pass = document.getElementById('login-password').value;
            const stored = window.getAdminCredentials();

            if (stored && email === stored.email && window.verifyPassword(pass, stored.password)) {
                isAdminAuthenticated = true;
                document.getElementById('admin-auth-modal').style.display = 'none';
                switchView('admin');
            } else {
                alert('Credenciales incorrectas');
            }
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            isAdminAuthenticated = false;
            switchView('dashboard');
        };
    }

    if (changeBtn) {
        changeBtn.onclick = () => {
            if (confirm('¿Seguro que deseas resetear la contraseña?')) {
                localStorage.removeItem('admin_credentials');
                location.reload();
            }
        };
    }
};

window.checkAdminAuth = () => {
    const modal = document.getElementById('admin-auth-modal');
    if (!modal) return false;

    const credentials = window.getAdminCredentials();
    if (!credentials) {
        // First time setup
        modal.style.display = 'flex';
        const setupForm = document.getElementById('admin-setup-form');
        const loginForm = document.getElementById('admin-login-form');
        if (setupForm) setupForm.style.display = 'block';
        if (loginForm) loginForm.style.display = 'none';
        return false;
    } else {
        // Login required
        modal.style.display = 'flex';
        const setupForm = document.getElementById('admin-setup-form');
        const loginForm = document.getElementById('admin-login-form');
        if (setupForm) setupForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        return false;
    }
};


// ===== 3. MOCK SUPABASE (For Demo Mode) =====
class MockSupabase {
    constructor() {
        console.log('🔌 Initializing MockSupabase (Local Storage Mode)');
        try {
            const stored = localStorage.getItem('demo_tickets');
            this.data = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading demo data, resetting:', e);
            this.data = [];
            localStorage.removeItem('demo_tickets');
        }
    }

    _save() {
        try {
            localStorage.setItem('demo_tickets', JSON.stringify(this.data));
        } catch (e) { console.error('Error saving data:', e); }
    }

    from(table) {
        if (table !== 'tickets') return this;
        const self = this;
        return {
            select: function (columns) {
                const queryResult = [...self.data];
                const queryChain = {
                    _results: queryResult,
                    eq: function (field, value) { this._results = this._results.filter(item => item[field] === value); return this; },
                    gte: function (field, value) { this._results = this._results.filter(item => item[field] >= value); return this; },
                    lte: function (field, value) { this._results = this._results.filter(item => item[field] <= value); return this; },
                    order: function (field, options) {
                        const ascending = options?.ascending !== false;
                        this._results.sort((a, b) => {
                            if (a[field] < b[field]) return ascending ? -1 : 1;
                            if (a[field] > b[field]) return ascending ? 1 : -1;
                            return 0;
                        });
                        return this;
                    },
                    then: function (resolve) { resolve({ data: this._results, error: null }); }
                };
                return queryChain;
            },
            insert: function (rows) {
                const newRows = rows.map(r => ({ ...r, id: Date.now().toString() + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() }));
                self.data.push(...newRows);
                self._save();
                return Promise.resolve({ data: newRows, error: null });
            },
            update: function (updates) {
                return {
                    eq: function (field, value) {
                        self.data = self.data.map(item => {
                            if (item[field] == value) { return { ...item, ...updates }; }
                            return item;
                        });
                        self._save();
                        return Promise.resolve({ error: null });
                    }
                };
            }
        };
    }
}

// ===== 4. SUPABASE INITIALIZATION =====
window.DEMO_MODE = false;
let supabaseClient = null;

try {
    // Check if CDN loaded Supabase
    if (window.supabase && window.supabase.createClient && CONFIG.supabase.url.startsWith('http')) {
        supabaseClient = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
        console.log('🟢 Supabase Client Initialized via CDN');
    } else {
        throw new Error('Supabase CDN not loaded or Config invalid');
    }
} catch (error) {
    console.warn('⚠️ Switching to DEMO MODE (Local Storage). Reason:', error.message);
    window.DEMO_MODE = true;
    supabaseClient = new MockSupabase();
}

// Define the global accessor used by functions (renamed to avoid conflict with CDN)
const db = supabaseClient;


// ===== 5. STATE MANAGEMENT =====
let currentView = 'dashboard';
let dashboardInterval = null;
let allTickets = [];

// ===== 6. MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOMContentLoaded fired');

    // Safely initialize theme
    try { initializeTheme(); } catch (e) { console.error('Theme init failed:', e); }

    // Safely setup auth
    try { setupAdminAuth(); } catch (e) { console.error('Auth setup failed:', e); }

    // Initialize App
    initializeApp().catch(e => console.error('Async Init failed:', e));

    if (window.DEMO_MODE) {
        showDemoModeToast();
    }
});

async function initializeApp() {
    console.log('🚀 Starting App Initialization...');

    // Load Admin Config
    loadAdminConfigToMemory();

    // Set up navigation
    setupNavigation();

    // Set up forms
    setupRegistrationForm();
    setupReportsFilters();
    setupAdminPanel();
    setupSearch();

    // Set default dates
    setDefaultDates();

    // Load initial data
    await loadDashboard();

    // Start auto-refresh
    startDashboardRefresh();

    console.log('✅ App Initialized Successfully');
}

// ===== THEME MANAGEMENT =====
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme, false);
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.onclick = toggleTheme;
    }
}

function setTheme(theme, animate = true) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// ===== CONFIGURATION MANAGEMENT =====
function loadAdminConfigToMemory() {
    try {
        const savedConfig = localStorage.getItem('admin_config');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            if (parsed.parking) CONFIG.parking = { ...CONFIG.parking, ...parsed.parking };
            if (parsed.pricing) CONFIG.pricing = { ...CONFIG.pricing, ...parsed.pricing };
            if (parsed.alerts) CONFIG.alerts = { ...CONFIG.alerts, ...parsed.alerts };
        }
    } catch (e) {
        console.error('Error loading admin config:', e);
    }
}

// ===== NAVIGATION =====
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.onclick = () => {
            const viewName = btn.dataset.view;
            switchView(viewName);
        };
    });
}

function switchView(viewName) {
    if (viewName === 'admin') {
        if (!isAdminAuthenticated) {
            checkAdminAuth();
            return;
        }
    }

    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) btn.classList.add('active');
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
            loadAdminPanelValues();
            stopDashboardRefresh();
        } else {
            stopDashboardRefresh();
        }
    }
}

// ===== DASHBOARD & SEARCH =====
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.oninput = () => renderFilteredTickets();
    }
}

async function loadDashboard() {
    console.log('Drawing Dashboard...');
    try {
        const { data: tickets, error } = await db
            .from('tickets')
            .select('*')
            .eq('estado_pago', false)
            .order('fecha_ingreso', { ascending: false });

        if (error) throw error;

        allTickets = tickets || [];
        updateStatistics(allTickets);
        renderFilteredTickets();
        console.log('Dashboard Data Loaded:', allTickets.length);

    } catch (error) {
        // Supabase errors are objects like { message, details, hint, code }
        // Extract the real message instead of showing [object Object]
        const errorMsg = error?.message || error?.details || JSON.stringify(error) || 'Error desconocido';
        console.error('Error loading dashboard:', errorMsg);

        // Auto-fallback to demo mode if Supabase connection fails
        if (!window.DEMO_MODE) {
            console.warn('⚠️ Supabase falló. Cambiando a modo DEMO automáticamente.');
            window.DEMO_MODE = true;
            // Replace db reference with mock
            window._supabaseClient = supabaseClient;
            Object.assign(db, new MockSupabase());
            showDemoModeToast();
            // Retry loading with mock data
            await loadDashboard();
            return;
        }

        const container = document.getElementById('active-tickets');
        if (container) {
            container.innerHTML = `<div class="alert alert-danger">❌ Error cargando datos: ${errorMsg}<br/>Revisa la conexión a Supabase o recarga la página.</div>`;
        }
    }
}

function renderFilteredTickets() {
    const query = document.getElementById('search-input')?.value.toLowerCase() || '';
    let filtered = allTickets;
    if (query) {
        filtered = allTickets.filter(ticket =>
            ticket.placa.toLowerCase().includes(query) ||
            ticket.nombre_cliente.toLowerCase().includes(query)
        );
    }
    renderActiveTickets(filtered);
}

function updateStatistics(activeTickets) {
    try {
        const currentVehicles = activeTickets.length;
        const total = document.getElementById('stat-current');
        if (total) total.textContent = currentVehicles;

        const totalSpaces = CONFIG && CONFIG.parking ? CONFIG.parking.totalSpaces : 50;
        const freeSpaces = totalSpaces - currentVehicles;
        const freeEl = document.getElementById('stat-free');
        if (freeEl) freeEl.textContent = Math.max(0, freeSpaces);

        calculateDailyRevenue();
    } catch (e) { console.error('Stats error:', e); }
}

async function calculateDailyRevenue() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: paidTickets, error } = await db
            .from('tickets')
            .select('total')
            .eq('estado_pago', true)
            .gte('fecha_ingreso', today.toISOString());

        if (error) throw error;

        const revenue = (paidTickets || []).reduce((sum, ticket) => sum + parseFloat(ticket.total || 0), 0);
        const revEl = document.getElementById('stat-revenue');
        if (revEl) revEl.textContent = formatCurrency(revenue);

    } catch (error) {
        console.error('Error calculating revenue:', error);
    }
}

function renderActiveTickets(tickets) {
    const container = document.getElementById('active-tickets');
    if (!container) return;

    if (!tickets || tickets.length === 0) {
        const query = document.getElementById('search-input')?.value;
        const message = query ? 'No se encontraron vehículos con esa búsqueda' : 'No hay vehículos en el parqueadero';

        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 3rem;">🅿️</div>
                <div class="empty-state-text">${message}</div>
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
                        <span class="ticket-info-label">Puesto:</span>
                        <span class="ticket-info-value">${ticket.puesto}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Salida Est:</span>
                        <span class="ticket-info-value">${formatDateTime(ticket.fecha_salida_estimada)}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Total:</span>
                        <span class="ticket-info-value">${formatCurrency(ticket.total)}</span>
                    </div>
                </div>
                
                <div class="ticket-actions">
                    <button class="btn btn-success" onclick="markAsPaid('${ticket.id}')">
                        ✅ Pagar
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
    const warningTime = CONFIG && CONFIG.alerts ? CONFIG.alerts.warningMinutes : 60;
    if (diffMinutes < 0) return 'danger';
    if (diffMinutes < warningTime) return 'warning';
    return '';
}

// ===== PRICE CALCULATION: Fixed Block Rates + Overtime =====
function calculatePrice(vehicleType, rateType, startDate, endDate) {
    const pricing = (CONFIG && CONFIG.pricing) ? CONFIG.pricing : {};
    let baseTotal = 0;

    // 1. Map rate_type to pricing key per vehicle
    const rateMap = {
        carro: {
            min:  pricing.carMinRate  || 5000,
            '6h': pricing.car6hRate   || 8000,
            '12h':pricing.car12hRate  || 15000,
            '24h':pricing.car24hRate  || 25000,
            minute: pricing.carMinuteRate || 100
        },
        moto: {
            min:  pricing.motoMinRate  || 3000,
            '6h': pricing.moto6hRate   || 5000,
            '12h':pricing.moto12hRate  || 9000,
            '24h':pricing.moto24hRate  || 15000,
            minute: pricing.motoMinuteRate || 60
        }
    };

    const vehicleRates = rateMap[vehicleType] || rateMap['carro'];
    baseTotal = vehicleRates[rateType] || vehicleRates['min'];
    const minuteRate = vehicleRates.minute;

    // 2. Calculate duration
    const durationInfo = (startDate && endDate)
        ? calculateDuration(startDate, endDate)
        : { totalHours: 0, hours: 0, days: 0, months: 0, totalMinutes: 0, minutes: 0 };

    // 3. Check for overtime
    let extraMinutes = 0;
    let extraTotal = 0;
    
    if (startDate && endDate && durationInfo.totalMinutes > 0) {
        const hoursMap = { min: 3, '6h': 6, '12h': 12, '24h': 24 };
        const allowedHours = hoursMap[rateType] || 3;
        const allowedMinutes = allowedHours * 60;
        
        // 5 minutes grace period
        if (durationInfo.totalMinutes > (allowedMinutes + 5)) {
            extraMinutes = durationInfo.totalMinutes - allowedMinutes;
            extraTotal = extraMinutes * minuteRate;
        }
    }

    const finalTotal = baseTotal + extraTotal;

    return { 
        total: Math.round(finalTotal), 
        baseTotal: Math.round(baseTotal),
        extraTotal: Math.round(extraTotal),
        extraMinutes: extraMinutes,
        minuteRate: minuteRate,
        quantity: 1, 
        durationInfo 
    };
}

// ===== NEW HELPER: WhatsApp Receipt Generator =====
// ===== NEW HELPER: POS Printer Generator (58mm) =====
// ===== NEW HELPER: POS Entry Ticket Generator (58mm) =====
function printEntryTicket(ticket) {
    // Create a new hidden iframe for each print
    const iframeId = 'print-frame-' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    
    // Entry-optimized HTML
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @page { size: 58mm auto; margin: 0; }
            body { 
                font-family: 'Courier New', Courier, monospace; 
                width: 48mm; 
                margin: 0; 
                padding: 10px 0; 
                font-size: 12px; 
                line-height: 1.2;
                color: #000;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .separator { border-top: 1px dashed black; margin: 8px 0; }
            .details { width: 100%; border-collapse: collapse; }
            .details td { padding: 3px 0; vertical-align: top; }
            .ticket-title { font-size: 16px; margin-bottom: 5px; }
            .footer { font-size: 11px; margin-top: 15px; }
            .big-plate { 
                font-size: 24px; 
                font-weight: bold; 
                border: 2px solid #000; 
                padding: 10px; 
                margin: 10px 0;
            }
        </style>
    </head>
    <body onload="window.print();">
        <div class="center bold ticket-title">TICKET DE INGRESO</div>
        <div class="center" style="font-size: 11px;">PARQUEADERO PROFESIONAL</div>
        <div class="separator"></div>
        
        <div class="center big-plate">${ticket.placa}</div>
        
        <table class="details">
            <tr><td class="bold">Cliente:</td><td style="text-align:right">${ticket.nombre_cliente}</td></tr>
            <tr><td class="bold">Puesto:</td><td style="text-align:right">${ticket.puesto}</td></tr>
            <tr><td class="bold">Vehículo:</td><td style="text-align:right">${ticket.tipo_vehiculo.toUpperCase()}</td></tr>
            <tr><td class="bold">Tarifa:</td><td style="text-align:right">${ticket.rate_type}</td></tr>
        </table>
        
        <div class="separator"></div>
        
        <div class="center">
            <div class="bold">FECHA Y HORA DE INGRESO</div>
            <div style="font-size: 15px; margin-top: 5px;">${formatDateTime(ticket.fecha_ingreso)}</div>
        </div>
        
        <div class="separator"></div>
        
        <div class="footer center">
            CONSERVE ESTE TICKET<br>
            Lo necesitará para la salida.<br>
            <span style="font-size: 9px; opacity: 0.7;">${new Date().toLocaleString()}</span>
        </div>
    </body>
    </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    // Clean up iframe after 2 minutes
    setTimeout(() => {
        try { document.body.removeChild(iframe); } catch(e){}
    }, 120000);
}

function printPOSReceipt(ticket, realExitDate, finalTotal) {
    const duration = calculateDuration(new Date(ticket.fecha_ingreso), realExitDate);
    const timeStr = `${duration.days > 0 ? duration.days + 'd ' : ''}${duration.hours}h ${duration.minutes}m`;
    
    // Create a new hidden iframe for each print
    const iframeId = 'print-frame-' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    
    // POS-Optimized HTML
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @page { size: 58mm auto; margin: 0; }
            body { 
                font-family: 'Courier New', Courier, monospace; 
                width: 48mm; 
                margin: 0; 
                padding: 10px 0; 
                font-size: 12px; 
                line-height: 1.2;
                color: #000;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .separator { border-top: 1px dashed black; margin: 8px 0; }
            .details { width: 100%; border-collapse: collapse; }
            .details td { padding: 3px 0; vertical-align: top; }
            .total-box { 
                margin: 10px 0; 
                border-top: 2px solid black; 
                border-bottom: 2px solid black;
                padding: 8px 0;
            }
            .total-label { font-size: 14px; }
            .total-value { font-size: 18px; font-weight: bold; }
            .footer { font-size: 11px; margin-top: 15px; }
        </style>
    </head>
    <body onload="window.print();">
        <div class="center bold" style="font-size: 16px;">PARQUEADERO</div>
        <div class="center" style="font-size: 11px;">Sistema de Gestión Profesional</div>
        <div class="separator"></div>
        
        <div class="center bold" style="font-size: 18px; background: #000; color: #fff; padding: 5px; margin-bottom: 5px;">
            ${ticket.placa}
        </div>
        
        <table class="details">
            <tr><td class="bold">Cliente:</td><td style="text-align:right">${ticket.nombre_cliente}</td></tr>
            <tr><td class="bold">Celular:</td><td style="text-align:right">${ticket.celular}</td></tr>
            <tr><td class="bold">Puesto:</td><td style="text-align:right">${ticket.puesto}</td></tr>
            <tr><td class="bold">Vehículo:</td><td style="text-align:right">${ticket.tipo_vehiculo.toUpperCase()}</td></tr>
        </table>
        
        <div class="separator"></div>
        
        <table class="details">
            <tr><td>ING:</td><td style="text-align:right">${formatDateTime(ticket.fecha_ingreso)}</td></tr>
            <tr><td>SAL:</td><td style="text-align:right">${formatDateTime(realExitDate.toISOString())}</td></tr>
            <tr><td class="bold">TIEMPO:</td><td style="text-align:right" class="bold">${timeStr}</td></tr>
        </table>
        
        <div class="total-box center">
            <div class="total-label">VALOR A PAGAR</div>
            <div class="total-value">${formatCurrency(finalTotal)}</div>
        </div>
        
        <div class="footer center">
            ¡GRACIAS POR SU VISITA!<br>
            Vuelva pronto.<br>
            <span style="font-size: 9px; opacity: 0.7;">${new Date().toLocaleString()}</span>
        </div>
    </body>
    </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    // Clean up iframe after 2 minutes
    setTimeout(() => {
        try { document.body.removeChild(iframe); } catch(e){}
    }, 120000);
}

function generateReceiptDetails(ticket, realExitDate, finalTotal) {
    const duration = calculateDuration(new Date(ticket.fecha_ingreso), realExitDate);
    const timeStr = `${duration.days > 0 ? duration.days + 'd ' : ''}${duration.hours}h ${duration.minutes}m`;

    // Receipt Text
    const text = `
🧾 *RECIBO DE PARQUEADERO*
--------------------------------
🅿️ *Placa:* ${ticket.placa}
👤 *Cliente:* ${ticket.nombre_cliente}
📅 *Ingreso:* ${formatDateTime(ticket.fecha_ingreso)}
🏁 *Salida:* ${formatDateTime(realExitDate.toISOString())}
⏱️ *Tiempo:* ${timeStr}
💲 *TOTAL PAGADO:* ${formatCurrency(finalTotal)}
--------------------------------
¡Gracias por confiar en nosotros!
`.trim();

    // WhatsApp URL
    // Default to Colombia (+57) if no code provided
    let phone = ticket.celular.replace(/\D/g, '');
    if (!phone.startsWith('57') && phone.length === 10) phone = '57' + phone;

    // Use whatsapp:// scheme for mobile devices, wa.me as fallback for desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const url = isMobile
        ? `whatsapp://send?phone=${phone}&text=${encodeURIComponent(text)}`
        : `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    return { text, url };
}

async function markAsPaid(ticketId) {
    try {
        // 1. Get current ticket details to ensure we have rate_type
        const { data: tickets, error: fetchError } = await db
            .from('tickets')
            .select('*')
            .eq('id', ticketId);

        if (fetchError) throw fetchError;
        const ticket = tickets && tickets.length > 0 ? tickets[0] : null;
        if (!ticket) throw new Error("Ticket no encontrado");

        // 2. Calculate Real Price based on NOW
        const now = new Date();
        const entryDate = new Date(ticket.fecha_ingreso);

        // Fallback to 'hour' if rate_type is missing (legacy records)
        const rateType = ticket.rate_type || 'hour';

        const priceDetails = calculatePrice(ticket.tipo_vehiculo, rateType, entryDate, now);
        const finalTotal = priceDetails.total;

        // 3. Show Custom Modal with payment details
        const rateLabels = { min: 'Tarifa Mínima', '6h': '6 Horas', '12h': '12 Horas', '24h': '24 Horas' };
        
        const timeStr = `${priceDetails.durationInfo.days > 0 ? priceDetails.durationInfo.days + 'd ' : ''}${priceDetails.durationInfo.hours}h ${priceDetails.durationInfo.minutes}m`;

        const confirmed = await showPaymentModal({
            placa: ticket.placa,
            tiempo: timeStr,
            tarifa: rateLabels[rateType] || rateType,
            baseTotal: priceDetails.baseTotal,
            extraTotal: priceDetails.extraTotal,
            extraMinutes: priceDetails.extraMinutes,
            minuteRate: priceDetails.minuteRate,
            total: finalTotal
        });

        if (!confirmed) return;

        // 4. Check if paper print is requested
        const shouldPrint = document.getElementById('print-pos-receipt')?.checked;

        // 5. Update DB
        const { error } = await db
            .from('tickets')
            .update({
                estado_pago: true,
                total: finalTotal,
                fecha_salida_real: now.toISOString()
            })
            .eq('id', ticketId);

        if (error) throw error;

        // 6. Handle Printing
        if (shouldPrint) {
            printPOSReceipt(ticket, now, finalTotal);
        }

        showSuccessMessage('Ticket pagado' + (shouldPrint ? ' e impreso 🖨️' : ' ✅'));
        await loadDashboard();

    } catch (error) {
        console.error('Error marking as paid:', error);
        alert('Error: ' + error.message);
    }
}

function startDashboardRefresh() {
    stopDashboardRefresh();
    dashboardInterval = setInterval(() => {
        if (currentView === 'dashboard') loadDashboard();
    }, CONFIG.refresh.dashboardInterval);
}

function stopDashboardRefresh() {
    if (dashboardInterval) {
        clearInterval(dashboardInterval);
        dashboardInterval = null;
    }
}

// ===== REGISTRATION =====
function setupRegistrationForm() {
    const form = document.getElementById('registro-form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        await handleRegistration();
    };

    // Re-calculate prices when changing vehicle type
    const vehicleTypeArr = document.getElementsByName('tipo_vehiculo');
    vehicleTypeArr.forEach(radio => {
        radio.addEventListener('change', () => {
            updateExitDateFromRate();
            updateRatePricesDisplay();
        });
    });

    // Re-calculate prices and dates when changing rate block
    const rateTypeArr = document.getElementsByName('rate_type');
    rateTypeArr.forEach(radio => {
        radio.addEventListener('change', () => {
            updateExitDateFromRate();
            updateRatePricesDisplay();
        });
    });

    // Manual date change still recalculates exit date
    const fechaIngreso = document.getElementById('fecha-ingreso');
    if (fechaIngreso) {
        fechaIngreso.onchange = () => {
            updateExitDateFromRate();
        };
    }

    updateExitDateFromRate();
    updateRatePricesDisplay();
}

// Auto-calculate exit date based on selected rate block
function updateExitDateFromRate() {
    const rateTypeArr = document.getElementsByName('rate_type');
    let rateType = 'min';
    for (let r of rateTypeArr) if (r.checked) rateType = r.value;

    const hoursMap = { min: 3, '6h': 6, '12h': 12, '24h': 24 };
    const hours = hoursMap[rateType] || 3;

    const fechaIngresoEl = document.getElementById('fecha-ingreso');
    const fechaSalidaEl = document.getElementById('fecha-salida');
    if (!fechaIngresoEl || !fechaIngresoEl.value) return;

    const ingreso = new Date(fechaIngresoEl.value);
    const salida = new Date(ingreso.getTime() + hours * 60 * 60 * 1000);
    const toLocalISO = (d) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };
    if (fechaSalidaEl) fechaSalidaEl.value = toLocalISO(salida);
}

// Update prices displayed directly on the rate buttons
function updateRatePricesDisplay() {
    const vehicleTypeArr = document.getElementsByName('tipo_vehiculo');
    let vehicleType = null;
    for (let r of vehicleTypeArr) if (r.checked) vehicleType = r.value;

    if (!vehicleType) return;

    // Get prices for all 4 block types for the selected vehicle type
    const rates = ['min', '6h', '12h', '24h'];
    rates.forEach(rateType => {
        const priceDetails = calculatePrice(vehicleType, rateType, null, null);
        const priceEl = document.getElementById(`price-${rateType}`);
        if (priceEl) {
            priceEl.textContent = formatCurrency(priceDetails.total);
        }
    });
}

// Helper function to calculate duration between two dates
function calculateDuration(startDate, endDate) {
    const diffMs = Math.max(0, endDate - startDate);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    
    const days = Math.floor(totalMinutes / (60 * 24));
    const remainingMinutesAfterDays = totalMinutes % (60 * 24);
    
    const hours = Math.floor(remainingMinutesAfterDays / 60);
    const minutes = remainingMinutesAfterDays % 60;

    return {
        totalHours: diffMs / (1000 * 60 * 60),
        totalMinutes: totalMinutes,
        days: days,
        hours: hours,
        minutes: minutes,
        months: 0
    };
}

function setDefaultDates() {
    const now = new Date();
    const toLocalISO = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };
    const ingresoEl = document.getElementById('fecha-ingreso');
    const salidaEl = document.getElementById('fecha-salida');

    if (ingresoEl) ingresoEl.value = toLocalISO(now);
    if (salidaEl) {
        const exitTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        salidaEl.value = toLocalISO(exitTime);
    }
}

async function handleRegistration() {
    const messageContainer = document.getElementById('registro-message');
    if (messageContainer) messageContainer.innerHTML = '';

    try {
        const fechaIngresoEl = document.getElementById('fecha-ingreso').value;
        const fechaIngreso = new Date(fechaIngresoEl);
        
        // Calculate the simulated estimated exit date based on the chosen rate
        const rateType = document.querySelector('input[name="rate_type"]:checked').value;
        const vehicleType = document.querySelector('input[name="tipo_vehiculo"]:checked').value;
        const hoursMap = { min: 3, '6h': 6, '12h': 12, '24h': 24 };
        const blockHours = hoursMap[rateType] || 3;
        const fechaSalidaEstimada = new Date(fechaIngreso.getTime() + blockHours * 60 * 60 * 1000);

        // Get total for the ticket
        const priceDetails = calculatePrice(vehicleType, rateType, null, null);

        const formData = {
            placa: document.getElementById('placa').value.trim().toUpperCase(),
            nombre_cliente: document.getElementById('nombre').value.trim(),
            celular: document.getElementById('celular').value.trim(),
            tipo_vehiculo: vehicleType,
            puesto: document.getElementById('puesto').value.trim().toUpperCase(),
            fecha_ingreso: fechaIngreso.toISOString(),
            fecha_salida_estimada: fechaSalidaEstimada.toISOString(),
            rate_type: rateType,
            total: priceDetails.total,
            estado_pago: false
        };

        const { error } = await db.from('tickets').insert([formData]);

        if (error) throw error;

        if (messageContainer) {
            messageContainer.innerHTML = `<div class="alert alert-success">✅ Vehículo registrado exitosamente - Placa: ${formData.placa}${DEMO_MODE ? ' (Demo)' : ''}</div>`;
            setTimeout(() => messageContainer.innerHTML = '', 5000);
            messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        document.getElementById('registro-form').reset();
        setDefaultDates();
        updateRatePricesDisplay();

    } catch (error) {
        console.error('Error registering vehicle:', error);
        if (messageContainer) messageContainer.innerHTML = `<div class="alert alert-danger">❌ Error: ${error.message}</div>`;
    }
}

// ===== REPORTS (Basic Implementation) =====
function setupReportsFilters() {
    const btnFilter = document.getElementById('btn-aplicar-filtros');
    if (btnFilter) {
        btnFilter.onclick = loadReports;
    }

    const btnPdf = document.getElementById('btn-exportar-pdf');
    if (btnPdf) {
        btnPdf.onclick = exportReportsToPDF;
    }
}

async function loadReports() {
    console.log('Loading reports...');
    const container = document.querySelector('#reportes tbody');
    if (!container) return;

    // Get filters
    const desde = document.getElementById('filter-desde')?.value;
    const hasta = document.getElementById('filter-hasta')?.value;
    const estado = document.getElementById('filter-estado')?.value || 'todos';

    // Show loading state
    container.innerHTML = '<tr><td colspan="8" class="text-center">Cargando reportes...</td></tr>';

    try {
        let query = db.from('tickets').select('*');

        // Apply filters
        if (desde) query = query.gte('fecha_ingreso', `${desde}T00:00:00`);
        if (hasta) query = query.lte('fecha_ingreso', `${hasta}T23:59:59`);
        if (estado === 'pagado') query = query.eq('estado_pago', true);
        if (estado === 'pendiente') query = query.eq('estado_pago', false);

        const { data: tickets, error } = await query
            .order('fecha_ingreso', { ascending: false });

        if (error) throw error;

        if (!tickets || tickets.length === 0) {
            container.innerHTML = '<tr><td colspan="7" class="text-center">No hay registros en el historial</td></tr>';
            return;
        }

        renderReportsTable(tickets);

    } catch (error) {
        console.error('Error loading reports:', error);
        container.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
}

function renderReportsTable(tickets) {
    const container = document.querySelector('#reportes tbody');
    if (!container) return;

    container.innerHTML = tickets.map(ticket => `
        <tr>
            <td>${ticket.placa}</td>
            <td>${ticket.nombre_cliente || '-'}</td>
            <td><span class="ticket-badge ${ticket.tipo_vehiculo}">${ticket.tipo_vehiculo}</span></td>
            <td>${ticket.puesto}</td>
            <td>${formatDateTime(ticket.fecha_ingreso)}</td>
            <td>${formatDateTime(ticket.fecha_salida_estimada)}</td>
            <td>${formatCurrency(ticket.total)}</td>
            <td>
                <span class="badge ${ticket.estado_pago ? 'bg-success' : 'bg-warning'}">
                    ${ticket.estado_pago ? 'Pagado' : 'Pendiente'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" style="min-height:30px; padding: 4px 8px; font-size: 12px;" onclick="reprintTicket('${ticket.id}')" title="Re-imprimir">
                    🖨️
                </button>
            </td>
        </tr>
    `).join('');
}

async function reprintTicket(ticketId) {
    try {
        const { data, error } = await db.from('tickets').select('*').eq('id', ticketId).single();
        if (error) throw error;
        
        if (data.estado_pago) {
            // Re-print payment receipt
            const exitDate = data.fecha_salida_real ? new Date(data.fecha_salida_real) : new Date();
            printPOSReceipt(data, exitDate, data.total);
        } else {
            // Re-print entry ticket
            printEntryTicket(data);
        }
        showSuccessMessage('Re-imprimiendo ticket... 🖨️');
    } catch (e) {
        console.error('Reprint error:', e);
        alert('Error al re-imprimir: ' + e.message);
    }
}

async function exportReportsToPDF() {
    if (!window.jspdf) {
        alert('Error: Librería PDF no cargada');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get current filtered data logic - ideally we should store the last fetched data
    // For now we will re-fetch or scrape from table. Scraping from table is easier for "what you see is what you get"

    // Header
    doc.setFontSize(18);
    doc.text('Reporte de Parqueadero', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleString('es-CO');
    doc.text(`Fecha de generación: ${dateStr}`, 14, 30);

    // Table Data
    const table = document.querySelector('.table');
    const rows = [];

    // Headers
    const headers = [['Placa', 'Cliente', 'Tipo', 'Puesto', 'Ingreso', 'Total', 'Estado']];

    // Body
    if (table) {
        const trs = table.querySelectorAll('tbody tr');
        trs.forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length > 1) { // Skip loading/empty rows
                rows.push([
                    tds[0].innerText, // Placa
                    tds[1].innerText, // Cliente
                    tds[2].innerText, // Tipo
                    tds[3].innerText, // Puesto
                    tds[4].innerText, // Ingreso
                    // Skip Salida Est (tds[5]) to save space
                    tds[6].innerText, // Total
                    tds[7].innerText  // Estado
                ]);
            }
        });
    }

    if (rows.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    doc.autoTable({
        head: headers,
        body: rows,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    doc.save(`reporte_parqueadero_${new Date().toISOString().slice(0, 10)}.pdf`);
}


// ===== ADMIN CONFIG =====
function setupAdminPanel() {
    const btnSave = document.getElementById('btn-save-config');
    if (btnSave) btnSave.onclick = saveAdminConfig;

    const btnReset = document.getElementById('btn-factory-reset');
    if (btnReset) btnReset.onclick = performFactoryReset;
}

function loadAdminPanelValues() {
    if (!CONFIG || !CONFIG.pricing) return;
    const p = CONFIG.pricing;
    const parking = CONFIG.parking || {};
    const alerts = CONFIG.alerts || {};

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set('admin-total-spaces',  parking.totalSpaces  || 50);
    set('admin-car-min-rate',  p.carMinRate   || 5000);
    set('admin-car-6h-rate',   p.car6hRate    || 8000);
    set('admin-car-12h-rate',  p.car12hRate   || 15000);
    set('admin-car-24h-rate',  p.car24hRate   || 25000);
    set('admin-car-minute-rate', p.carMinuteRate || 100);
    set('admin-moto-min-rate', p.motoMinRate  || 3000);
    set('admin-moto-6h-rate',  p.moto6hRate   || 5000);
    set('admin-moto-12h-rate', p.moto12hRate  || 9000);
    set('admin-moto-24h-rate', p.moto24hRate  || 15000);
    set('admin-moto-minute-rate', p.motoMinuteRate || 60);
    set('admin-warning-minutes', alerts.warningMinutes || 60);
}

function saveAdminConfig() {
    const get = (id, fallback) => parseInt(document.getElementById(id)?.value) || fallback;

    CONFIG.parking.totalSpaces = get('admin-total-spaces', 50);
    CONFIG.alerts.warningMinutes = get('admin-warning-minutes', 60);
    CONFIG.pricing.carMinRate   = get('admin-car-min-rate',  5000);
    CONFIG.pricing.car6hRate    = get('admin-car-6h-rate',   8000);
    CONFIG.pricing.car12hRate   = get('admin-car-12h-rate',  15000);
    CONFIG.pricing.car24hRate   = get('admin-car-24h-rate',  25000);
    CONFIG.pricing.carMinuteRate = get('admin-car-minute-rate', 100);
    CONFIG.pricing.motoMinRate  = get('admin-moto-min-rate', 3000);
    CONFIG.pricing.moto6hRate   = get('admin-moto-6h-rate',  5000);
    CONFIG.pricing.moto12hRate  = get('admin-moto-12h-rate', 9000);
    CONFIG.pricing.moto24hRate  = get('admin-moto-24h-rate', 15000);
    CONFIG.pricing.motoMinuteRate = get('admin-moto-minute-rate', 60);

    localStorage.setItem('admin_config', JSON.stringify(CONFIG));
    showSuccessMessage('💾 Configuración guardada exitosamente');
}

async function performFactoryReset() {
    if (!isAdminAuthenticated) return;

    // Confirm 1
    if (!confirm('⚠️ ¿ESTÁS SEGURO?\n\nEsto borrará TODO el historial de vehículos y registros.\nEsta acción NO se puede deshacer.')) {
        return;
    }

    // Confirm 2
    const validation = prompt('Para confirmar, escribe: BORRAR');
    if (validation !== 'BORRAR') {
        alert('Acción cancelada. El código de confirmación no coincide.');
        return;
    }

    try {
        console.log('🗑️ Starting Factory Reset...');

        // Delete all data. 
        // Note: Supabase requires a WHERE clause for delete(). 
        // We use neq('id', 0) assuming UUIDs or just a condition that matches all.
        const { error } = await db
            .from('tickets')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all

        if (error) throw error;

        alert('✅ SISTEMA REINICIADO CORRECTAMENTE\n\nTodos los datos han sido eliminados.');
        location.reload();

    } catch (error) {
        console.error('Error in factory reset:', error);
        alert('❌ Error al reiniciar: ' + error.message);
    }
}

// ===== UTILS =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
    } catch (e) { return dateString; }
}

function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success';
    notification.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;min-width:300px;box-shadow:0 10px 30px rgba(0,0,0,0.1)';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

function showDemoModeToast() {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #f39c12;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        font-weight: bold;
    `;
    toast.textContent = '⚠️ MODO DEMO ACTIVADO (Datos Locales)';
    document.body.appendChild(toast);
}

// ===== CUSTOM PAYMENT MODAL FUNCTIONS =====
let paymentModalResolve = null;

function showPaymentModal(data) {
    return new Promise((resolve) => {
        paymentModalResolve = resolve;

        // Populate modal with data
        document.getElementById('modal-placa').textContent = data.placa;
        document.getElementById('modal-tiempo').textContent = data.tiempo;
        document.getElementById('modal-tarifa').textContent = data.tarifa;
        document.getElementById('modal-total').textContent = formatCurrency(data.total);
        document.getElementById('modal-base').textContent = formatCurrency(data.baseTotal || data.total);
        
        const overtimeRow = document.getElementById('modal-overtime-row');
        const overtimeValue = document.getElementById('modal-overtime');
        const noteEl = document.getElementById('modal-note');
        
        if (data.extraMinutes > 0) {
            overtimeRow.style.display = 'flex';
            overtimeValue.textContent = `${data.extraMinutes} min × ${formatCurrency(data.minuteRate)} = ${formatCurrency(data.extraTotal)}`;
            noteEl.textContent = 'El valor incluye recargo por tiempo extra.';
            noteEl.style.color = 'var(--color-warning)';
        } else {
            overtimeRow.style.display = 'none';
            noteEl.textContent = 'Tarifa fija por bloque contratado.';
            noteEl.style.color = 'var(--color-text-muted)';
        }

        // Show modal
        document.getElementById('payment-confirm-modal').style.display = 'flex';
    });
}

function closePaymentModal(confirmed) {
    document.getElementById('payment-confirm-modal').style.display = 'none';
    if (paymentModalResolve) {
        paymentModalResolve(confirmed);
        paymentModalResolve = null;
    }
}

// Make global
window.markAsPaid = markAsPaid;
window.closePaymentModal = closePaymentModal;
window.reprintTicket = reprintTicket;

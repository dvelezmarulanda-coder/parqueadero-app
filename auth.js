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
    try {
        const creds = localStorage.getItem('admin_credentials');
        return creds ? JSON.parse(creds) : null;
    } catch (e) {
        console.error('Error reading admin credentials:', e);
        return null;
    }
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
    showSuccessMessage('🚪 Sesión cerrada');
    switchView('dashboard');
}

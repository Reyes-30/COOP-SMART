// ===================================
// Configuración API
// ===================================
const API_URL = (window.location.hostname === 'localhost' || window.location.protocol === 'file:')
    ? 'http://localhost:3000' 
    : 'https://coop-smart.vercel.app';

// ===================================
// Estado Global
// ===================================
let userData = null;
let dashboardData = {
    totalSocios: 0,
    saldoTotal: 0,
    prestamosActivos: 0,
    transaccionesHoy: 0,
    transacciones: []
};

// ===================================
// Inicialización
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    checkAuthentication();
    
    // Cargar datos del usuario
    loadUserData();
    
    // Cargar datos del dashboard
    loadDashboardData();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar gráficos (placeholder)
    initializeCharts();
});

// ===================================
// Autenticación
// ===================================
function checkAuthentication() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
}

function loadUserData() {
    try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        userData = user;
        
        // Actualizar información del usuario en la UI
        const userNameElements = document.querySelectorAll('#userName');
        const userRoleElements = document.querySelectorAll('#userRole');
        
        userNameElements.forEach(el => {
            el.textContent = user.nombre_completo || user.nombre_usuario || 'Usuario';
        });
        
        userRoleElements.forEach(el => {
            el.textContent = translateRole(user.rol) || 'Usuario';
        });
    } catch (error) {
        console.error('Error al cargar usuario:', error);
    }
}

function translateRole(role) {
    const roles = {
        'administrador': 'Administrador',
        'cajero': 'Cajero',
        'socio': 'Socio'
    };
    return roles[role] || role;
}

// ===================================
// Event Listeners
// ===================================
function setupEventListeners() {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
    
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    
    // Quick actions
    setupQuickActions();
}

function handleLogout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function setupQuickActions() {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const actions = [
                'socios.html',
                'cuentas.html',
                'prestamos.html',
                'transacciones.html'
            ];
            // Por ahora solo mostramos alerta, luego redirigiremos
            showNotification('Función en desarrollo', 'info');
            // window.location.href = actions[index];
        });
    });
}

// ===================================
// Cargar Datos del Dashboard
// ===================================
async function loadDashboardData() {
    try {
        await Promise.all([
            loadKPIData(),
            loadTransactions()
        ]);
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        showNotification('Error al cargar datos del dashboard', 'error');
    }
}

async function loadKPIData() {
    const token = localStorage.getItem('token');
    
    try {
        // Cargar total de socios
        const sociosResponse = await fetch(`${API_URL}/api/socios`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (sociosResponse.ok) {
            const socios = await sociosResponse.json();
            dashboardData.totalSocios = socios.length;
            updateKPI('totalSocios', dashboardData.totalSocios);
        }
        
        // Cargar cuentas y calcular saldo total
        const cuentasResponse = await fetch(`${API_URL}/api/cuentas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (cuentasResponse.ok) {
            const cuentas = await cuentasResponse.json();
            dashboardData.saldoTotal = cuentas.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
            updateKPI('saldoTotal', formatCurrency(dashboardData.saldoTotal));
        }
        
        // Cargar préstamos activos
        const prestamosResponse = await fetch(`${API_URL}/api/prestamos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (prestamosResponse.ok) {
            const prestamos = await prestamosResponse.json();
            dashboardData.prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
            updateKPI('prestamosActivos', dashboardData.prestamosActivos);
        }
        
        // Cargar transacciones de hoy
        const transaccionesResponse = await fetch(`${API_URL}/api/transacciones`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (transaccionesResponse.ok) {
            const transacciones = await transaccionesResponse.json();
            const hoy = new Date().toISOString().split('T')[0];
            dashboardData.transaccionesHoy = transacciones.filter(t => {
                const fechaTransaccion = new Date(t.fecha).toISOString().split('T')[0];
                return fechaTransaccion === hoy;
            }).length;
            updateKPI('transaccionesHoy', dashboardData.transaccionesHoy);
        }
        
    } catch (error) {
        console.error('Error cargando KPIs:', error);
        // Mostrar datos de ejemplo en caso de error
        updateKPI('totalSocios', '0');
        updateKPI('saldoTotal', '$0.00');
        updateKPI('prestamosActivos', '0');
        updateKPI('transaccionesHoy', '0');
    }
}

async function loadTransactions() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('transactionsBody');
    
    try {
        const response = await fetch(`${API_URL}/api/transacciones`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const transacciones = await response.json();
            dashboardData.transacciones = transacciones;
            
            // Mostrar últimas 10 transacciones
            const recentTransactions = transacciones
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, 10);
            
            displayTransactions(recentTransactions);
        } else {
            throw new Error('Error al cargar transacciones');
        }
        
    } catch (error) {
        console.error('Error cargando transacciones:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray-500);">
                    <p>No se pudieron cargar las transacciones</p>
                    <button onclick="loadTransactions()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-blue); color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

function displayTransactions(transacciones) {
    const tbody = document.getElementById('transactionsBody');
    
    if (transacciones.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray-500);">
                    <span style="font-size: 3rem;">📋</span>
                    <p>No hay transacciones registradas</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = transacciones.map(t => {
        const fecha = new Date(t.fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const statusClass = getStatusClass(t.estado);
        const statusText = getStatusText(t.estado);
        const tipoIcon = getTipoIcon(t.tipo);
        
        return `
            <tr>
                <td><strong>#${t.id_transaccion}</strong></td>
                <td>${fecha}</td>
                <td>Socio #${t.id_socio}</td>
                <td>
                    <span style="display: flex; align-items: center; gap: 0.5rem;">
                        ${tipoIcon} ${capitalize(t.tipo)}
                    </span>
                </td>
                <td>Cuenta #${t.id_cuenta}</td>
                <td><strong>${formatCurrency(t.monto)}</strong></td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-icon-btn" onclick="viewTransaction(${t.id_transaccion})" title="Ver detalles">
                            👁️
                        </button>
                        <button class="action-icon-btn" onclick="printTransaction(${t.id_transaccion})" title="Imprimir">
                            🖨️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ===================================
// Funciones de Utilidad
// ===================================
function updateKPI(id, value) {
    const element = document.getElementById(id);
    if (element) {
        // Animación de conteo
        animateValue(element, value);
    }
}

function animateValue(element, value) {
    element.textContent = value;
    element.style.animation = 'none';
    setTimeout(() => {
        element.style.animation = 'fadeIn 0.5s ease-in-out';
    }, 10);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL',
        minimumFractionDigits: 2
    }).format(amount);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusClass(estado) {
    const statusMap = {
        'completada': 'success',
        'activo': 'success',
        'pendiente': 'pending',
        'procesando': 'pending',
        'rechazada': 'failed',
        'cancelada': 'failed'
    };
    return statusMap[estado] || 'pending';
}

function getStatusText(estado) {
    const textMap = {
        'completada': 'Completada',
        'activo': 'Activo',
        'pendiente': 'Pendiente',
        'procesando': 'Procesando',
        'rechazada': 'Rechazada',
        'cancelada': 'Cancelada'
    };
    return textMap[estado] || estado;
}

function getTipoIcon(tipo) {
    const iconMap = {
        'deposito': '💰',
        'retiro': '💸',
        'transferencia': '🔄',
        'pago': '💳'
    };
    return iconMap[tipo] || '📝';
}

// ===================================
// Acciones de Transacciones
// ===================================
function viewTransaction(id) {
    showNotification(`Ver detalles de transacción #${id}`, 'info');
    // Aquí se implementará el modal de detalles
}

function printTransaction(id) {
    showNotification(`Imprimiendo transacción #${id}`, 'info');
    // Aquí se implementará la función de impresión
}

// ===================================
// Notificaciones
// ===================================
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? 'var(--error)' : type === 'success' ? 'var(--success)' : 'var(--info)'};
        color: white;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.3s ease-in-out;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    notification.innerHTML = `
        <span style="font-size: 1.25rem;">${icon}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===================================
// Gráficos (Placeholder)
// ===================================
function initializeCharts() {
    // Placeholder para los gráficos
    const monthlyChart = document.getElementById('monthlyChart');
    const accountsChart = document.getElementById('accountsChart');
    
    if (monthlyChart) {
        monthlyChart.getContext('2d');
        drawPlaceholderChart(monthlyChart, 'Gráfico de movimientos mensuales');
    }
    
    if (accountsChart) {
        accountsChart.getContext('2d');
        drawPlaceholderChart(accountsChart, 'Gráfico de distribución de cuentas');
    }
}

function drawPlaceholderChart(canvas, text) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight || 300;
    
    // Fondo
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texto
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📊', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('(Se implementará con Chart.js)', canvas.width / 2, canvas.height / 2 + 45);
}

// ===================================
// Animaciones CSS adicionales
// ===================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Auto-refresh (cada 5 minutos)
// ===================================
setInterval(() => {
    loadDashboardData();
}, 300000); // 5 minutos

console.log('🎯 Dashboard COOP-SMART inicializado correctamente');

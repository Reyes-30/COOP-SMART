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
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    }
    
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
            const sociosData = await sociosResponse.json();
            // Manejar respuesta paginada o array directo
            const socios = Array.isArray(sociosData) ? sociosData : (sociosData.socios || []);
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
            const cuentasData = await cuentasResponse.json();
            // Manejar respuesta paginada o array directo
            const cuentas = Array.isArray(cuentasData) ? cuentasData : (cuentasData.cuentas || []);
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
                try {
                    const fechaTransaccion = new Date(t.fecha);
                    // Validar que la fecha es válida
                    if (isNaN(fechaTransaccion.getTime())) {
                        return false;
                    }
                    return fechaTransaccion.toISOString().split('T')[0] === hoy;
                } catch (error) {
                    console.warn('Fecha inválida en transacción:', t);
                    return false;
                }
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
    const tbody = document.getElementById('transaccionesTableBody');
    
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
        const tbody = document.getElementById('transaccionesTableBody');
        if (tbody) {
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
}

function displayTransactions(transacciones) {
    const tbody = document.getElementById('transaccionesTableBody');
    
    // Validar que el elemento existe
    if (!tbody) {
        console.warn('Elemento transaccionesTableBody no encontrado en el DOM');
        return;
    }
    
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
// Gráficos con Chart.js
// ===================================
let chartMovimientos = null;
let chartCuentas = null;

function initializeCharts() {
    crearGraficoMovimientos();
    crearGraficoCuentas();
}

async function crearGraficoMovimientos() {
    const canvas = document.getElementById('chartMovimientos');
    if (!canvas || typeof Chart === 'undefined') return;
    
    // Destruir gráfico anterior si existe
    if (chartMovimientos) {
        chartMovimientos.destroy();
    }
    
    try {
        const token = localStorage.getItem('token');
        
        // Cargar transacciones para obtener datos de movimientos
        const response = await fetch(`${API_URL}/api/transacciones`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const transacciones = response.ok ? await response.json() : [];
        
        // Procesar datos por mes
        const datosPorMes = procesarMovimientosMensuales(transacciones);
        
        const ctx = canvas.getContext('2d');
        chartMovimientos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datosPorMes.labels,
                datasets: [
                    {
                        label: 'Depósitos',
                        data: datosPorMes.depositos,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1
                    },
                    {
                        label: 'Retiros',
                        data: datosPorMes.retiros,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'L. ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creando gráfico de movimientos:', error);
    }
}

function procesarMovimientosMensuales(transacciones) {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const anioActual = new Date().getFullYear();
    const mesActual = new Date().getMonth();
    
    // Últimos 6 meses
    const labels = [];
    const depositos = [];
    const retiros = [];
    
    for (let i = 5; i >= 0; i--) {
        let mes = mesActual - i;
        let anio = anioActual;
        if (mes < 0) {
            mes += 12;
            anio -= 1;
        }
        labels.push(meses[mes] + ' ' + anio);
        
        // Filtrar transacciones del mes
        const transDelMes = transacciones.filter(t => {
            const fecha = new Date(t.fecha);
            return fecha.getMonth() === mes && fecha.getFullYear() === anio;
        });
        
        const totalDepositos = transDelMes
            .filter(t => t.tipo === 'deposito')
            .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);
        
        const totalRetiros = transDelMes
            .filter(t => t.tipo === 'retiro')
            .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);
        
        depositos.push(totalDepositos);
        retiros.push(totalRetiros);
    }
    
    return { labels, depositos, retiros };
}

async function crearGraficoCuentas() {
    const canvas = document.getElementById('chartCuentas');
    if (!canvas || typeof Chart === 'undefined') return;
    
    // Destruir gráfico anterior si existe
    if (chartCuentas) {
        chartCuentas.destroy();
    }
    
    try {
        const token = localStorage.getItem('token');
        
        // Cargar cuentas
        const response = await fetch(`${API_URL}/api/cuentas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = response.ok ? await response.json() : [];
        const cuentas = Array.isArray(data) ? data : (data.cuentas || []);
        
        // Contar por tipo
        const ahorro = cuentas.filter(c => c.tipo_cuenta === 'ahorro').length;
        const corriente = cuentas.filter(c => c.tipo_cuenta === 'corriente').length;
        const plazoFijo = cuentas.filter(c => c.tipo_cuenta === 'plazo_fijo').length;
        
        const ctx = canvas.getContext('2d');
        chartCuentas = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ahorro', 'Corriente', 'Plazo Fijo'],
                datasets: [{
                    data: [ahorro, corriente, plazoFijo],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(249, 115, 22, 0.8)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(168, 85, 247)',
                        'rgb(249, 115, 22)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creando gráfico de cuentas:', error);
    }
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

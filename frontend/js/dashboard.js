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
let socios = [];
let cuentas = [];
let dashboardData = {
    totalSocios: 0,
    sociosActivos: 0,
    saldoTotal: 0,
    totalCuentas: 0,
    prestamosActivos: 0,
    montoPrestamos: 0,
    transaccionesHoy: 0,
    montoMovidoHoy: 0,
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
    const actions = [
        'socios.html',
        'cuentas.html',
        'prestamos.html',
        'transacciones.html'
    ];
    
    actionButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (actions[index]) {
                window.location.href = actions[index];
            }
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
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (sociosResponse.ok) {
            const sociosData = await sociosResponse.json();
            socios = Array.isArray(sociosData) ? sociosData : (sociosData.socios || []);
            dashboardData.totalSocios = socios.length;
            dashboardData.sociosActivos = socios.filter(s => s.estado === 'activo').length;
            updateKPI('totalSocios', dashboardData.totalSocios);
            updateSubKPI('countSocios', `${dashboardData.sociosActivos} activos`);
        }
        
        // Cargar cuentas y calcular saldo total
        const cuentasResponse = await fetch(`${API_URL}/api/cuentas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (cuentasResponse.ok) {
            const cuentasData = await cuentasResponse.json();
            cuentas = Array.isArray(cuentasData) ? cuentasData : (cuentasData.cuentas || []);
            const cuentasActivas = cuentas.filter(c => c.estado === 'activa');
            dashboardData.totalCuentas = cuentasActivas.length;
            dashboardData.saldoTotal = cuentasActivas.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
            updateKPI('saldoTotal', formatCurrency(dashboardData.saldoTotal));
            updateSubKPI('countCuentas', `${dashboardData.totalCuentas} cuentas`);
        }
        
        // Cargar préstamos activos
        const prestamosResponse = await fetch(`${API_URL}/api/prestamos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (prestamosResponse.ok) {
            const prestamos = await prestamosResponse.json();
            const prestamosActivos = prestamos.filter(p => ['activo', 'aprobado', 'desembolsado'].includes(p.estado));
            dashboardData.prestamosActivos = prestamosActivos.length;
            dashboardData.montoPrestamos = prestamosActivos.reduce((sum, p) => sum + parseFloat(p.monto_aprobado || p.monto_solicitado || 0), 0);
            updateKPI('prestamosActivos', dashboardData.prestamosActivos);
            updateSubKPI('montoTotal', formatCurrency(dashboardData.montoPrestamos) + ' total');
        }
        
        // Cargar transacciones de hoy
        const transaccionesResponse = await fetch(`${API_URL}/api/transacciones`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (transaccionesResponse.ok) {
            const transacciones = await transaccionesResponse.json();
            const hoy = new Date().toISOString().split('T')[0];
            
            const transaccionesHoy = transacciones.filter(t => {
                try {
                    const fecha = t.fecha_transaccion || t.createdAt;
                    if (!fecha) return false;
                    const fechaTransaccion = new Date(fecha);
                    if (isNaN(fechaTransaccion.getTime())) return false;
                    return fechaTransaccion.toISOString().split('T')[0] === hoy;
                } catch (error) {
                    return false;
                }
            });
            
            dashboardData.transaccionesHoy = transaccionesHoy.length;
            dashboardData.montoMovidoHoy = transaccionesHoy.reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);
            updateKPI('transaccionesHoy', dashboardData.transaccionesHoy);
            updateSubKPI('montoHoy', formatCurrency(dashboardData.montoMovidoHoy) + ' movido');
        }
        
    } catch (error) {
        console.error('Error cargando KPIs:', error);
        updateKPI('totalSocios', '0');
        updateKPI('saldoTotal', formatCurrency(0));
        updateKPI('prestamosActivos', '0');
        updateKPI('transaccionesHoy', '0');
    }
}

function updateSubKPI(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
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
            
            // Mostrar últimas 10 transacciones (ordenar por fecha_transaccion o createdAt)
            const recentTransactions = transacciones
                .sort((a, b) => {
                    const fechaA = new Date(a.fecha_transaccion || a.createdAt || 0);
                    const fechaB = new Date(b.fecha_transaccion || b.createdAt || 0);
                    return fechaB - fechaA;
                })
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
        // Usar fecha correcta del modelo
        const fechaStr = t.fecha_transaccion || t.createdAt || t.fecha;
        let fechaFormateada = 'Sin fecha';
        if (fechaStr) {
            const fecha = new Date(fechaStr);
            if (!isNaN(fecha.getTime())) {
                fechaFormateada = fecha.toLocaleDateString('es-HN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
        }
        
        // Obtener información de la cuenta y socio
        const cuenta = cuentas.find(c => c.id === t.id_cuenta);
        const socio = cuenta ? socios.find(s => s.id === cuenta.id_socio) : null;
        const nombreSocio = socio ? `${socio.nombre} ${socio.apellido}` : 'N/A';
        const numeroCuenta = cuenta ? cuenta.numero_cuenta : `#${t.id_cuenta}`;
        
        const tipoIcon = getTipoIcon(t.tipo);
        const tipoFormateado = formatearTipoTransaccion(t.tipo);
        
        // Estado basado en si tiene saldo_nuevo (completada)
        const estado = t.saldo_nuevo !== undefined ? 'completada' : 'pendiente';
        const statusClass = getStatusClass(estado);
        const statusText = getStatusText(estado);
        
        return `
            <tr>
                <td><strong>#${t.numero_transaccion || t.id}</strong></td>
                <td>${fechaFormateada}</td>
                <td>${nombreSocio}</td>
                <td>
                    <span style="display: flex; align-items: center; gap: 0.5rem;">
                        ${tipoIcon} ${tipoFormateado}
                    </span>
                </td>
                <td>Cuenta ${numeroCuenta}</td>
                <td><strong>${formatCurrency(t.monto)}</strong></td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-icon-btn" onclick="viewTransaction(${t.id})" title="Ver detalles">
                            👁️
                        </button>
                        <button class="action-icon-btn" onclick="printTransaction(${t.id})" title="Imprimir">
                            🖨️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function formatearTipoTransaccion(tipo) {
    const tipos = {
        'deposito': 'Depósito',
        'retiro': 'Retiro',
        'transferencia_entrada': 'Transferencia_entrada',
        'transferencia_salida': 'Transferencia_salida',
        'interes': 'Interés',
        'cargo': 'Cargo',
        'apertura': 'Apertura',
        'cierre': 'Cierre'
    };
    return tipos[tipo] || capitalize(tipo);
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
        'transferencia_entrada': '📥',
        'transferencia_salida': '📤',
        'pago': '💳',
        'interes': '📈',
        'cargo': '📉',
        'apertura': '🆕',
        'cierre': '🔒'
    };
    return iconMap[tipo] || '📝';
}

// ===================================
// Acciones de Transacciones
// ===================================
function viewTransaction(id) {
    const transaccion = dashboardData.transacciones.find(t => t.id === id);
    if (!transaccion) {
        showNotification('Transacción no encontrada', 'error');
        return;
    }
    
    const cuenta = cuentas.find(c => c.id === transaccion.id_cuenta);
    const socio = cuenta ? socios.find(s => s.id === cuenta.id_socio) : null;
    const nombreSocio = socio ? `${socio.nombre} ${socio.apellido}` : 'N/A';
    const numeroCuenta = cuenta ? cuenta.numero_cuenta : `#${transaccion.id_cuenta}`;
    
    const fechaStr = transaccion.fecha_transaccion || transaccion.createdAt;
    let fechaFormateada = 'Sin fecha';
    if (fechaStr) {
        const fecha = new Date(fechaStr);
        if (!isNaN(fecha.getTime())) {
            fechaFormateada = fecha.toLocaleString('es-HN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    
    // Crear modal de detalles
    const modalHTML = `
        <div id="modalDetallesTransaccion" class="modal-overlay" style="
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); display: flex; align-items: center;
            justify-content: center; z-index: 10000;">
            <div class="modal-content" style="
                background: white; border-radius: 16px; padding: 2rem;
                max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0; color: #1e3a5f;">📋 Detalles de Transacción</h2>
                    <button onclick="cerrarModalDetalles()" style="
                        background: none; border: none; font-size: 1.5rem;
                        cursor: pointer; color: #666;">&times;</button>
                </div>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 1.5rem;">
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">ID Transacción:</span>
                            <strong>${transaccion.numero_transaccion || '#' + transaccion.id}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">Tipo:</span>
                            <strong>${getTipoIcon(transaccion.tipo)} ${formatearTipoTransaccion(transaccion.tipo)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">Fecha:</span>
                            <strong>${fechaFormateada}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">Cuenta:</span>
                            <strong>${numeroCuenta}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">Titular:</span>
                            <strong>${nombreSocio}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">Monto:</span>
                            <strong style="color: ${transaccion.tipo === 'deposito' || transaccion.tipo === 'transferencia_entrada' ? '#10b981' : '#ef4444'}; font-size: 1.25rem;">
                                ${transaccion.tipo === 'deposito' || transaccion.tipo === 'transferencia_entrada' ? '+' : '-'}${formatCurrency(transaccion.monto)}
                            </strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">Saldo Anterior:</span>
                            <strong>${formatCurrency(transaccion.saldo_anterior || 0)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">Saldo Nuevo:</span>
                            <strong style="color: #3b82f6;">${formatCurrency(transaccion.saldo_nuevo || 0)}</strong>
                        </div>
                        ${transaccion.descripcion ? `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span style="color: #64748b;">Descripción:</span>
                            <strong>${transaccion.descripcion}</strong>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button onclick="printTransaction(${transaccion.id})" style="
                        flex: 1; padding: 0.75rem; background: #3b82f6; color: white;
                        border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🖨️ Imprimir
                    </button>
                    <button onclick="cerrarModalDetalles()" style="
                        flex: 1; padding: 0.75rem; background: #e2e8f0; color: #475569;
                        border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('modalDetallesTransaccion');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Cerrar al hacer clic fuera
    document.getElementById('modalDetallesTransaccion').addEventListener('click', (e) => {
        if (e.target.id === 'modalDetallesTransaccion') {
            cerrarModalDetalles();
        }
    });
}

function cerrarModalDetalles() {
    const modal = document.getElementById('modalDetallesTransaccion');
    if (modal) modal.remove();
}

function printTransaction(id) {
    const transaccion = dashboardData.transacciones.find(t => t.id === id);
    if (!transaccion) {
        showNotification('Transacción no encontrada', 'error');
        return;
    }
    
    const cuenta = cuentas.find(c => c.id === transaccion.id_cuenta);
    const socio = cuenta ? socios.find(s => s.id === cuenta.id_socio) : null;
    const nombreSocio = socio ? `${socio.nombre} ${socio.apellido}` : 'N/A';
    const numeroCuenta = cuenta ? cuenta.numero_cuenta : `#${transaccion.id_cuenta}`;
    
    const fechaStr = transaccion.fecha_transaccion || transaccion.createdAt;
    let fechaFormateada = 'Sin fecha';
    if (fechaStr) {
        const fecha = new Date(fechaStr);
        if (!isNaN(fecha.getTime())) {
            fechaFormateada = fecha.toLocaleString('es-HN');
        }
    }
    
    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Recibo de Transacción - COOP-SMART</title>
            <style>
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    padding: 20px;
                    max-width: 400px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #1e3a5f;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .header h1 {
                    color: #1e3a5f;
                    margin: 0;
                    font-size: 24px;
                }
                .header p {
                    color: #666;
                    margin: 5px 0 0;
                }
                .tipo {
                    text-align: center;
                    background: ${transaccion.tipo === 'deposito' || transaccion.tipo === 'transferencia_entrada' ? '#d1fae5' : '#fee2e2'};
                    color: ${transaccion.tipo === 'deposito' || transaccion.tipo === 'transferencia_entrada' ? '#065f46' : '#991b1b'};
                    padding: 10px;
                    border-radius: 8px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .details {
                    margin-bottom: 20px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dashed #ddd;
                }
                .detail-row:last-child {
                    border-bottom: none;
                }
                .label {
                    color: #666;
                }
                .value {
                    font-weight: bold;
                    color: #333;
                }
                .monto {
                    text-align: center;
                    font-size: 28px;
                    font-weight: bold;
                    color: ${transaccion.tipo === 'deposito' || transaccion.tipo === 'transferencia_entrada' ? '#10b981' : '#ef4444'};
                    margin: 20px 0;
                    padding: 15px;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 2px solid #1e3a5f;
                    color: #666;
                    font-size: 12px;
                }
                @media print {
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏦 COOP-SMART</h1>
                <p>Sistema de Gestión Cooperativa</p>
            </div>
            
            <div class="tipo">
                ${formatearTipoTransaccion(transaccion.tipo).toUpperCase()}
            </div>
            
            <div class="monto">
                ${transaccion.tipo === 'deposito' || transaccion.tipo === 'transferencia_entrada' ? '+' : '-'}${formatCurrency(transaccion.monto)}
            </div>
            
            <div class="details">
                <div class="detail-row">
                    <span class="label">No. Transacción:</span>
                    <span class="value">${transaccion.numero_transaccion || transaccion.id}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Fecha:</span>
                    <span class="value">${fechaFormateada}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Cuenta:</span>
                    <span class="value">${numeroCuenta}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Titular:</span>
                    <span class="value">${nombreSocio}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Saldo Anterior:</span>
                    <span class="value">${formatCurrency(transaccion.saldo_anterior || 0)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Saldo Nuevo:</span>
                    <span class="value">${formatCurrency(transaccion.saldo_nuevo || 0)}</span>
                </div>
                ${transaccion.descripcion ? `
                <div class="detail-row">
                    <span class="label">Descripción:</span>
                    <span class="value">${transaccion.descripcion}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p>Gracias por su preferencia</p>
                <p>Impreso el: ${new Date().toLocaleString('es-HN')}</p>
            </div>
            
            <script>window.onload = () => { window.print(); }<\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
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
        
        // Filtrar transacciones del mes usando fecha correcta
        const transDelMes = transacciones.filter(t => {
            const fechaStr = t.fecha_transaccion || t.createdAt;
            if (!fechaStr) return false;
            const fecha = new Date(fechaStr);
            if (isNaN(fecha.getTime())) return false;
            return fecha.getMonth() === mes && fecha.getFullYear() === anio;
        });
        
        const totalDepositos = transDelMes
            .filter(t => t.tipo === 'deposito' || t.tipo === 'transferencia_entrada')
            .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);
        
        const totalRetiros = transDelMes
            .filter(t => t.tipo === 'retiro' || t.tipo === 'transferencia_salida')
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

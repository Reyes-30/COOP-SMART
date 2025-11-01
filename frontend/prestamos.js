// ============================================
// PRÉSTAMOS - FUNCIONALIDAD COMPLETA
// ============================================

// Configuración de API
const API_URL = (window.location.hostname === 'localhost' || window.location.protocol === 'file:')
    ? 'http://localhost:3000' 
    : 'https://coop-smart.vercel.app';

// Estado de la aplicación
let prestamos = [];
let socios = [];
let cuentas = [];
let pagos = [];
let filtroActual = 'todos';
let prestamoActual = null;

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarUsuario();
    initEventListeners();
    cargarDatos();
    
    // Auto-refresh cada 60 segundos
    setInterval(() => {
        cargarPrestamos();
    }, 60000);
});

// Verificar autenticación
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
}

// Cargar información del usuario
function cargarUsuario() {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const userNameElements = document.querySelectorAll('#userName');
            const userRoleElements = document.querySelectorAll('#userRole');
            
            userNameElements.forEach(el => el.textContent = user.nombre_completo || user.nombre_usuario || 'Usuario');
            userRoleElements.forEach(el => el.textContent = user.rol || 'Usuario');
        }
    } catch (error) {
        console.error('Error al cargar usuario:', error);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
    
    // Búsqueda global
    document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleFilterClick(e.target.closest('.filter-btn')));
    });
    
    // Botones principales
    document.getElementById('btnNuevoPrestamo').addEventListener('click', abrirModalNuevoPrestamo);
    document.getElementById('btnCalculadora').addEventListener('click', abrirModalCalculadora);
    
    // Modal Nuevo Préstamo
    document.getElementById('btnCloseNuevo').addEventListener('click', cerrarModalNuevoPrestamo);
    document.getElementById('btnCancelarNuevo').addEventListener('click', cerrarModalNuevoPrestamo);
    document.getElementById('formNuevoPrestamo').addEventListener('submit', handleCrearPrestamo);
    
    // Cambios en formulario para actualizar preview
    document.getElementById('id_socio').addEventListener('change', handleCambioSocio);
    document.getElementById('monto').addEventListener('input', actualizarPreview);
    document.getElementById('plazo_meses').addEventListener('change', actualizarPreview);
    document.getElementById('tasa_interes').addEventListener('input', actualizarPreview);
    
    // Modal Detalles
    document.getElementById('btnCloseDetalles').addEventListener('click', cerrarModalDetalles);
    document.getElementById('btnCerrarDetalles').addEventListener('click', cerrarModalDetalles);
    document.getElementById('btnImprimirPrestamo').addEventListener('click', imprimirPrestamo);
    document.getElementById('btnAprobar').addEventListener('click', aprobarPrestamo);
    document.getElementById('btnRechazar').addEventListener('click', rechazarPrestamo);
    
    // Tabs en modal detalles
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleTabClick(e.target));
    });
    
    // Modal Calculadora
    document.getElementById('btnCloseCalculadora').addEventListener('click', cerrarModalCalculadora);
    document.getElementById('btnCalcular').addEventListener('click', calcular);
    
    // Cerrar modales al hacer click fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
}

// ============================================
// CARGAR DATOS
// ============================================

async function cargarDatos() {
    await Promise.all([
        cargarSocios(),
        cargarCuentas(),
        cargarPrestamos()
    ]);
}

async function cargarPrestamos() {
    try {
        showLoading(true);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/prestamos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar préstamos');
        
        prestamos = await response.json();
        actualizarEstadisticas();
        renderizarPrestamos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los préstamos');
    } finally {
        showLoading(false);
    }
}

async function cargarSocios() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/socios`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar socios');
        
        socios = await response.json();
        llenarSelectSocios();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarCuentas() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/cuentas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar cuentas');
        
        cuentas = await response.json();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarPagos(idPrestamo) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/pagos?id_prestamo=${idPrestamo}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar pagos');
        
        return await response.json();
        
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// ============================================
// ESTADÍSTICAS
// ============================================

function actualizarEstadisticas() {
    // Total prestado
    const totalPrestado = prestamos
        .filter(p => p.estado === 'aprobado' || p.estado === 'mora')
        .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);
    document.getElementById('totalPrestado').textContent = formatearMoneda(totalPrestado);
    
    // Préstamos activos
    const activos = prestamos.filter(p => p.estado === 'aprobado' || p.estado === 'mora').length;
    document.getElementById('prestamosActivos').textContent = activos;
    
    // Pendientes de aprobación
    const pendientes = prestamos.filter(p => p.estado === 'pendiente').length;
    document.getElementById('prestamosPendientes').textContent = pendientes;
    
    // En mora
    const enMora = prestamos.filter(p => p.estado === 'mora').length;
    document.getElementById('prestamosEnMora').textContent = enMora;
    
    // Actualizar contadores de filtros
    document.getElementById('countTodos').textContent = prestamos.length;
    document.getElementById('countPendiente').textContent = 
        prestamos.filter(p => p.estado === 'pendiente').length;
    document.getElementById('countAprobado').textContent = 
        prestamos.filter(p => p.estado === 'aprobado').length;
    document.getElementById('countRechazado').textContent = 
        prestamos.filter(p => p.estado === 'rechazado').length;
    document.getElementById('countPagado').textContent = 
        prestamos.filter(p => p.estado === 'pagado').length;
}

// ============================================
// RENDERIZAR TABLA
// ============================================

function renderizarPrestamos() {
    const tbody = document.getElementById('prestamosTableBody');
    
    // Filtrar préstamos
    let prestamosFiltrados = prestamos.filter(prestamo => {
        if (filtroActual !== 'todos' && prestamo.estado !== filtroActual) {
            return false;
        }
        return true;
    });
    
    if (prestamosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <p style="color: #6B7280; font-size: 1rem;">No se encontraron préstamos</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = prestamosFiltrados.map(prestamo => {
        const cuotaMensual = calcularCuotaMensual(
            prestamo.monto,
            prestamo.tasa_interes,
            prestamo.plazo_meses
        );
        
        return `
            <tr>
                <td><strong>#${prestamo.id}</strong></td>
                <td>${obtenerNombreSocio(prestamo.id_socio)}</td>
                <td><span class="badge badge-${prestamo.proposito}">${capitalizar(prestamo.proposito)}</span></td>
                <td><strong>${formatearMoneda(prestamo.monto)}</strong></td>
                <td>${prestamo.tasa_interes}%</td>
                <td>${prestamo.plazo_meses} meses</td>
                <td><strong>${formatearMoneda(cuotaMensual)}</strong></td>
                <td><span class="badge badge-${prestamo.estado}">${capitalizar(prestamo.estado)}</span></td>
                <td>${formatearFecha(prestamo.fecha_solicitud)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="verDetalles(${prestamo.id})" title="Ver detalles">
                            👁️
                        </button>
                        ${prestamo.estado === 'pendiente' ? `
                            <button class="action-btn btn-edit" onclick="aprobarPrestamoRapido(${prestamo.id})" title="Aprobar">
                                ✅
                            </button>
                            <button class="action-btn btn-block" onclick="rechazarPrestamoRapido(${prestamo.id})" title="Rechazar">
                                ❌
                            </button>
                        ` : ''}
                        ${prestamo.estado === 'aprobado' ? `
                            <button class="action-btn btn-deposit" onclick="registrarPago(${prestamo.id})" title="Registrar pago">
                                💵
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================

function handleFilterClick(btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    filtroActual = btn.dataset.filter;
    renderizarPrestamos();
}

function handleGlobalSearch(e) {
    const busqueda = e.target.value.toLowerCase().trim();
    
    if (!busqueda) {
        renderizarPrestamos();
        return;
    }
    
    const tbody = document.getElementById('prestamosTableBody');
    const prestamosFiltrados = prestamos.filter(prestamo => {
        const solicitante = obtenerNombreSocio(prestamo.id_socio).toLowerCase();
        const id = prestamo.id.toString();
        const proposito = prestamo.proposito.toLowerCase();
        
        return id.includes(busqueda) || 
               solicitante.includes(busqueda) || 
               proposito.includes(busqueda);
    });
    
    if (prestamosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <p style="color: #6B7280; font-size: 1rem;">No se encontraron resultados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = prestamosFiltrados.map(prestamo => {
        const cuotaMensual = calcularCuotaMensual(
            prestamo.monto,
            prestamo.tasa_interes,
            prestamo.plazo_meses
        );
        
        return `
            <tr>
                <td><strong>#${prestamo.id}</strong></td>
                <td>${obtenerNombreSocio(prestamo.id_socio)}</td>
                <td><span class="badge badge-${prestamo.proposito}">${capitalizar(prestamo.proposito)}</span></td>
                <td><strong>${formatearMoneda(prestamo.monto)}</strong></td>
                <td>${prestamo.tasa_interes}%</td>
                <td>${prestamo.plazo_meses} meses</td>
                <td><strong>${formatearMoneda(cuotaMensual)}</strong></td>
                <td><span class="badge badge-${prestamo.estado}">${capitalizar(prestamo.estado)}</span></td>
                <td>${formatearFecha(prestamo.fecha_solicitud)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="verDetalles(${prestamo.id})">👁️</button>
                        ${prestamo.estado === 'pendiente' ? `
                            <button class="action-btn btn-edit" onclick="aprobarPrestamoRapido(${prestamo.id})">✅</button>
                            <button class="action-btn btn-block" onclick="rechazarPrestamoRapido(${prestamo.id})">❌</button>
                        ` : ''}
                        ${prestamo.estado === 'aprobado' ? `
                            <button class="action-btn btn-deposit" onclick="registrarPago(${prestamo.id})">💵</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// MODAL NUEVO PRÉSTAMO
// ============================================

function abrirModalNuevoPrestamo() {
    document.getElementById('formNuevoPrestamo').reset();
    document.getElementById('tasa_interes').value = '12.00';
    document.getElementById('infoSolicitante').style.display = 'none';
    actualizarPreview();
    document.getElementById('modalNuevoPrestamo').classList.add('show');
}

function cerrarModalNuevoPrestamo() {
    document.getElementById('modalNuevoPrestamo').classList.remove('show');
}

function llenarSelectSocios() {
    const select = document.getElementById('id_socio');
    select.innerHTML = '<option value="">Seleccionar...</option>';
    
    socios
        .filter(s => s.estado === 'activo')
        .forEach(socio => {
            const option = document.createElement('option');
            option.value = socio.id;
            option.dataset.tipo = socio.tipo;
            option.textContent = `${socio.nombre} ${socio.apellido} - ${socio.identidad} (${capitalizar(socio.tipo)})`;
            select.appendChild(option);
        });
}

function handleCambioSocio(e) {
    const socioId = parseInt(e.target.value);
    const selectCuenta = document.getElementById('id_cuenta');
    const tasaInput = document.getElementById('tasa_interes');
    const helperTasa = document.getElementById('helperTasa');
    const infoBox = document.getElementById('infoSolicitante');
    const textoInfo = document.getElementById('textoInfoSolicitante');
    
    if (!socioId) {
        selectCuenta.innerHTML = '<option value="">Primero seleccione un solicitante</option>';
        infoBox.style.display = 'none';
        return;
    }
    
    const socio = socios.find(s => s.id === socioId);
    const cuentasSocio = cuentas.filter(c => c.id_socio === socioId && c.estado === 'activa');
    
    // Llenar select de cuentas
    selectCuenta.innerHTML = '<option value="">Seleccionar cuenta...</option>';
    cuentasSocio.forEach(cuenta => {
        const option = document.createElement('option');
        option.value = cuenta.id;
        option.textContent = `${cuenta.numero_cuenta} - ${formatearTipoCuenta(cuenta.tipo_cuenta)} (${formatearMoneda(cuenta.saldo)})`;
        selectCuenta.appendChild(option);
    });
    
    // Ajustar tasa según tipo de socio
    if (socio.tipo === 'socio') {
        tasaInput.value = '10.00';
        helperTasa.textContent = 'Tasa recomendada para socios: 8-12%';
        textoInfo.textContent = 'Este es un SOCIO, aplica tasa preferencial de 8-12% anual';
    } else {
        tasaInput.value = '17.00';
        helperTasa.textContent = 'Tasa recomendada para clientes: 15-20%';
        textoInfo.textContent = 'Este es un CLIENTE, aplica tasa estándar de 15-20% anual';
    }
    
    infoBox.style.display = 'flex';
    actualizarPreview();
}

function actualizarPreview() {
    const monto = parseFloat(document.getElementById('monto').value) || 0;
    const plazo = parseInt(document.getElementById('plazo_meses').value) || 12;
    const tasa = parseFloat(document.getElementById('tasa_interes').value) || 0;
    
    const cuotaMensual = calcularCuotaMensual(monto, tasa, plazo);
    const totalPagar = cuotaMensual * plazo;
    const totalIntereses = totalPagar - monto;
    
    document.getElementById('previewMonto').textContent = formatearMoneda(monto);
    document.getElementById('previewCuota').textContent = formatearMoneda(cuotaMensual);
    document.getElementById('previewTotal').textContent = formatearMoneda(totalPagar);
    document.getElementById('previewIntereses').textContent = formatearMoneda(totalIntereses);
}

async function handleCrearPrestamo(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        id_socio: parseInt(formData.get('id_socio')),
        id_cuenta: parseInt(formData.get('id_cuenta')),
        monto: parseFloat(formData.get('monto')),
        tasa_interes: parseFloat(formData.get('tasa_interes')),
        plazo_meses: parseInt(formData.get('plazo_meses')),
        proposito: formData.get('proposito'),
        descripcion: formData.get('descripcion') || '',
        estado: 'pendiente'
    };
    
    // Validaciones
    if (!data.id_socio || !data.id_cuenta) {
        mostrarError('Debe seleccionar un solicitante y una cuenta');
        return;
    }
    
    if (data.monto < 1000) {
        mostrarError('El monto mínimo es L. 1,000.00');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/prestamos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear préstamo');
        }
        
        mostrarExito('Solicitud de préstamo creada exitosamente');
        cerrarModalNuevoPrestamo();
        cargarPrestamos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message || 'Error al crear la solicitud');
    }
}

// ============================================
// MODAL DETALLES
// ============================================

async function verDetalles(idPrestamo) {
    const prestamo = prestamos.find(p => p.id === idPrestamo);
    if (!prestamo) return;
    
    prestamoActual = prestamo;
    
    // Llenar información básica
    document.getElementById('detallesId').textContent = `Préstamo #${prestamo.id}`;
    document.getElementById('detallesSolicitante').textContent = obtenerNombreSocio(prestamo.id_socio);
    document.getElementById('detallesMonto').textContent = formatearMoneda(prestamo.monto);
    
    document.getElementById('detallesEstado').textContent = capitalizar(prestamo.estado);
    document.getElementById('detallesEstado').className = `badge badge-${prestamo.estado}`;
    
    document.getElementById('detallesProposito').textContent = capitalizar(prestamo.proposito);
    document.getElementById('detallesProposito').className = `badge badge-${prestamo.proposito}`;
    
    // Botones de acción según estado
    const btnAprobar = document.getElementById('btnAprobar');
    const btnRechazar = document.getElementById('btnRechazar');
    
    if (prestamo.estado === 'pendiente') {
        btnAprobar.style.display = 'inline-flex';
        btnRechazar.style.display = 'inline-flex';
    } else {
        btnAprobar.style.display = 'none';
        btnRechazar.style.display = 'none';
    }
    
    // Tab Información
    const cuotaMensual = calcularCuotaMensual(prestamo.monto, prestamo.tasa_interes, prestamo.plazo_meses);
    const totalPagar = cuotaMensual * prestamo.plazo_meses;
    const totalIntereses = totalPagar - prestamo.monto;
    
    const infoHTML = `
        <div class="detail-item">
            <div class="detail-label">ID Préstamo</div>
            <div class="detail-value">#${prestamo.id}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Solicitante</div>
            <div class="detail-value">${obtenerNombreSocio(prestamo.id_socio)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Cuenta Desembolso</div>
            <div class="detail-value">${obtenerNumeroCuenta(prestamo.id_cuenta)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Propósito</div>
            <div class="detail-value">${capitalizar(prestamo.proposito)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Monto Prestado</div>
            <div class="detail-value">${formatearMoneda(prestamo.monto)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Tasa de Interés</div>
            <div class="detail-value">${prestamo.tasa_interes}% anual</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Plazo</div>
            <div class="detail-value">${prestamo.plazo_meses} meses</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Cuota Mensual</div>
            <div class="detail-value">${formatearMoneda(cuotaMensual)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Total a Pagar</div>
            <div class="detail-value">${formatearMoneda(totalPagar)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Total Intereses</div>
            <div class="detail-value">${formatearMoneda(totalIntereses)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Fecha Solicitud</div>
            <div class="detail-value">${formatearFecha(prestamo.fecha_solicitud)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Estado</div>
            <div class="detail-value">${capitalizar(prestamo.estado)}</div>
        </div>
        ${prestamo.descripcion ? `
            <div class="detail-item" style="grid-column: 1 / -1;">
                <div class="detail-label">Descripción</div>
                <div class="detail-value">${prestamo.descripcion}</div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('detallesInformacion').innerHTML = infoHTML;
    
    // Cargar historial de pagos
    await cargarHistorialPagos(idPrestamo);
    
    // Generar plan de pagos
    generarPlanPagos(prestamo);
    
    // Mostrar modal
    document.getElementById('modalDetalles').classList.add('show');
    
    // Activar primer tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="informacion"]').classList.add('active');
    document.getElementById('tabInformacion').classList.add('active');
}

async function cargarHistorialPagos(idPrestamo) {
    const tbody = document.getElementById('pagosBody');
    
    try {
        const pagosPrestamo = await cargarPagos(idPrestamo);
        
        if (pagosPrestamo.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #6B7280;">
                        No hay pagos registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = pagosPrestamo.map((pago, index) => `
            <tr>
                <td>${formatearFechaHora(pago.fecha_pago)}</td>
                <td>Cuota #${index + 1}</td>
                <td><strong>${formatearMoneda(pago.monto)}</strong></td>
                <td>${formatearMoneda(pago.saldo_restante || 0)}</td>
                <td><span class="cuota-pagada">Pagada</span></td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #EF4444;">
                    Error al cargar pagos
                </td>
            </tr>
        `;
    }
}

function generarPlanPagos(prestamo) {
    const tbody = document.getElementById('planBody');
    const cuotaMensual = calcularCuotaMensual(prestamo.monto, prestamo.tasa_interes, prestamo.plazo_meses);
    const tasaMensual = prestamo.tasa_interes / 100 / 12;
    
    let saldoPendiente = prestamo.monto;
    const filas = [];
    
    const fechaInicio = new Date(prestamo.fecha_solicitud);
    
    for (let i = 1; i <= prestamo.plazo_meses; i++) {
        const interes = saldoPendiente * tasaMensual;
        const capital = cuotaMensual - interes;
        saldoPendiente -= capital;
        
        const fechaVencimiento = new Date(fechaInicio);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
        
        filas.push(`
            <tr>
                <td>${i}</td>
                <td>${formatearFecha(fechaVencimiento)}</td>
                <td><strong>${formatearMoneda(cuotaMensual)}</strong></td>
                <td>${formatearMoneda(capital)}</td>
                <td>${formatearMoneda(interes)}</td>
                <td>${formatearMoneda(Math.max(0, saldoPendiente))}</td>
            </tr>
        `);
    }
    
    tbody.innerHTML = filas.join('');
}

function cerrarModalDetalles() {
    document.getElementById('modalDetalles').classList.remove('show');
    prestamoActual = null;
}

function handleTabClick(btn) {
    const tabName = btn.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`tab${capitalizar(tabName)}`).classList.add('active');
}

function imprimirPrestamo() {
    window.print();
}

// ============================================
// APROBAR / RECHAZAR
// ============================================

async function aprobarPrestamo() {
    if (!prestamoActual) return;
    await cambiarEstadoPrestamo(prestamoActual.id, 'aprobado');
}

async function rechazarPrestamo() {
    if (!prestamoActual) return;
    await cambiarEstadoPrestamo(prestamoActual.id, 'rechazado');
}

async function aprobarPrestamoRapido(idPrestamo) {
    await cambiarEstadoPrestamo(idPrestamo, 'aprobado');
}

async function rechazarPrestamoRapido(idPrestamo) {
    await cambiarEstadoPrestamo(idPrestamo, 'rechazado');
}

async function cambiarEstadoPrestamo(idPrestamo, nuevoEstado) {
    const accion = nuevoEstado === 'aprobado' ? 'aprobar' : 'rechazar';
    
    if (!confirm(`¿Está seguro que desea ${accion} este préstamo?`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/prestamos/${idPrestamo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        if (!response.ok) throw new Error(`Error al ${accion} préstamo`);
        
        mostrarExito(`Préstamo ${nuevoEstado} exitosamente`);
        cerrarModalDetalles();
        cargarPrestamos();
        
        // Si fue aprobado, desembolsar a la cuenta
        if (nuevoEstado === 'aprobado') {
            const prestamo = prestamos.find(p => p.id === idPrestamo);
            if (prestamo) {
                await desembolsarPrestamo(prestamo);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(`Error al ${accion} el préstamo`);
    }
}

async function desembolsarPrestamo(prestamo) {
    try {
        const token = localStorage.getItem('token');
        
        // Obtener saldo actual de la cuenta
        const cuenta = cuentas.find(c => c.id === prestamo.id_cuenta);
        if (!cuenta) return;
        
        const nuevoSaldo = parseFloat(cuenta.saldo) + parseFloat(prestamo.monto);
        
        // Actualizar saldo de la cuenta
        await fetch(`${API_URL}/api/cuentas/${prestamo.id_cuenta}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ saldo: nuevoSaldo })
        });
        
        // Registrar transacción
        await fetch(`${API_URL}/api/transacciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id_cuenta: prestamo.id_cuenta,
                tipo: 'deposito',
                monto: prestamo.monto,
                descripcion: `Desembolso de préstamo #${prestamo.id}`
            })
        });
        
    } catch (error) {
        console.error('Error al desembolsar:', error);
    }
}

// ============================================
// REGISTRAR PAGO
// ============================================

function registrarPago(idPrestamo) {
    const prestamo = prestamos.find(p => p.id === idPrestamo);
    if (!prestamo) return;
    
    // Por ahora mostrar alerta
    mostrarExito('Función de registro de pago en desarrollo.\nDirigirse al módulo de Pagos.');
}

// ============================================
// MODAL CALCULADORA
// ============================================

function abrirModalCalculadora() {
    document.getElementById('modalCalculadora').classList.add('show');
    document.getElementById('calcResults').style.display = 'none';
}

function cerrarModalCalculadora() {
    document.getElementById('modalCalculadora').classList.remove('show');
}

function calcular() {
    const monto = parseFloat(document.getElementById('calc_monto').value) || 0;
    const plazo = parseInt(document.getElementById('calc_plazo').value) || 0;
    const tasa = parseFloat(document.getElementById('calc_tasa').value) || 0;
    
    if (monto <= 0 || plazo <= 0 || tasa < 0) {
        mostrarError('Por favor ingrese valores válidos');
        return;
    }
    
    const cuotaMensual = calcularCuotaMensual(monto, tasa, plazo);
    const totalPagar = cuotaMensual * plazo;
    const totalIntereses = totalPagar - monto;
    const costoEfectivo = (totalIntereses / monto) * 100;
    
    document.getElementById('resultCuota').textContent = formatearMoneda(cuotaMensual);
    document.getElementById('resultTotal').textContent = formatearMoneda(totalPagar);
    document.getElementById('resultIntereses').textContent = formatearMoneda(totalIntereses);
    document.getElementById('resultCosto').textContent = costoEfectivo.toFixed(2) + '%';
    
    document.getElementById('calcResults').style.display = 'block';
}

// ============================================
// UTILIDADES
// ============================================

function calcularCuotaMensual(monto, tasaAnual, plazoMeses) {
    if (tasaAnual === 0) {
        return monto / plazoMeses;
    }
    
    const tasaMensual = tasaAnual / 100 / 12;
    const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                  (Math.pow(1 + tasaMensual, plazoMeses) - 1);
    
    return cuota;
}

function obtenerNombreSocio(idSocio) {
    const socio = socios.find(s => s.id === idSocio);
    return socio ? `${socio.nombre} ${socio.apellido}` : 'Desconocido';
}

function obtenerNumeroCuenta(idCuenta) {
    const cuenta = cuentas.find(c => c.id === idCuenta);
    return cuenta ? cuenta.numero_cuenta : 'N/A';
}

function formatearTipoCuenta(tipo) {
    const tipos = {
        'ahorro': 'Ahorro',
        'corriente': 'Corriente',
        'plazo_fijo': 'Plazo Fijo'
    };
    return tipos[tipo] || tipo;
}

function formatearMoneda(valor) {
    return `L. ${parseFloat(valor).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatearFechaHora(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function showLoading(show) {
    const tbody = document.getElementById('prestamosTableBody');
    if (show) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="10">
                    <div class="loading-spinner"></div>
                    <p>Cargando préstamos...</p>
                </td>
            </tr>
        `;
    }
}

function mostrarExito(mensaje) {
    alert('✓ ' + mensaje);
}

function mostrarError(mensaje) {
    alert('✗ ' + mensaje);
}

function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

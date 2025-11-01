// ============================================
// TRANSACCIONES - FUNCIONALIDAD COMPLETA
// ============================================

// Configuración de API
const API_URL = (window.location.hostname === 'localhost' || window.location.protocol === 'file:')
    ? 'http://localhost:3000' 
    : 'https://coop-smart.vercel.app';

// Estado de la aplicación
let transacciones = [];
let cuentas = [];
let socios = [];
let filtros = {
    tipo: 'todos',
    periodo: 'hoy',
    fechaDesde: null,
    fechaHasta: null,
    cuenta: 'todas',
    montoMin: null,
    montoMax: null
};

// Paginación
let paginaActual = 1;
const itemsPorPagina = 50;

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarUsuario();
    initEventListeners();
    cargarDatos();
    
    // Auto-refresh cada 30 segundos
    setInterval(() => {
        cargarTransacciones();
    }, 30000);
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
    
    // Filtros de tipo
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => handleTipoFilter(e.target));
    });
    
    // Filtros de período
    document.querySelectorAll('.date-chip').forEach(chip => {
        chip.addEventListener('click', (e) => handlePeriodoFilter(e.target));
    });
    
    // Aplicar fechas personalizadas
    document.getElementById('btnAplicarFechas').addEventListener('click', aplicarFechasPersonalizadas);
    
    // Aplicar filtros
    document.getElementById('btnAplicarFiltros').addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Filtro de monto con enter
    document.getElementById('montoMin').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') aplicarFiltros();
    });
    document.getElementById('montoMax').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') aplicarFiltros();
    });
    
    // Botones principales
    document.getElementById('btnNuevaTransaccion').addEventListener('click', abrirModalNuevaTransaccion);
    document.getElementById('btnExportarCSV').addEventListener('click', exportarCSV);
    document.getElementById('btnExportarPDF').addEventListener('click', exportarPDF);
    
    // Modal Nueva Transacción
    document.getElementById('btnCloseNueva').addEventListener('click', cerrarModalNuevaTransaccion);
    document.getElementById('btnCancelarNueva').addEventListener('click', cerrarModalNuevaTransaccion);
    document.getElementById('formNuevaTransaccion').addEventListener('submit', handleNuevaTransaccion);
    
    // Cambios en formulario
    document.getElementById('id_cuenta').addEventListener('change', mostrarInfoCuenta);
    document.querySelectorAll('input[name="tipo"]').forEach(radio => {
        radio.addEventListener('change', handleTipoTransaccionChange);
    });
    document.getElementById('monto').addEventListener('input', actualizarPreviewSaldo);
    
    // Modal Detalles
    document.getElementById('btnCloseDetalles').addEventListener('click', cerrarModalDetalles);
    document.getElementById('btnCerrarDetalles').addEventListener('click', cerrarModalDetalles);
    document.getElementById('btnImprimirRecibo').addEventListener('click', imprimirRecibo);
    
    // Paginación
    document.getElementById('btnPrevPage').addEventListener('click', paginaAnterior);
    document.getElementById('btnNextPage').addEventListener('click', paginaSiguiente);
    
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
        cargarCuentas(),
        cargarSocios(),
        cargarTransacciones()
    ]);
}

async function cargarTransacciones() {
    try {
        showLoading(true);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/transacciones`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar transacciones');
        
        transacciones = await response.json();
        
        // Ordenar por fecha descendente (más reciente primero)
        transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        actualizarEstadisticas();
        aplicarFiltros();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar las transacciones');
    } finally {
        showLoading(false);
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
        llenarSelectCuentas();
        llenarFiltroCuentas();
        
    } catch (error) {
        console.error('Error:', error);
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
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============================================
// ESTADÍSTICAS
// ============================================

function actualizarEstadisticas() {
    // Depósitos
    const depositos = transacciones.filter(t => t.tipo === 'deposito');
    const totalDepositos = depositos.reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);
    document.getElementById('totalDepositos').textContent = formatearMoneda(totalDepositos);
    document.getElementById('countDepositos').textContent = `${depositos.length} transacciones`;
    
    // Retiros
    const retiros = transacciones.filter(t => t.tipo === 'retiro');
    const totalRetiros = retiros.reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);
    document.getElementById('totalRetiros').textContent = formatearMoneda(totalRetiros);
    document.getElementById('countRetiros').textContent = `${retiros.length} transacciones`;
    
    // Transferencias
    const transferencias = transacciones.filter(t => t.tipo === 'transferencia');
    const totalTransferencias = transferencias.reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);
    document.getElementById('totalTransferencias').textContent = formatearMoneda(totalTransferencias);
    document.getElementById('countTransferencias').textContent = `${transferencias.length} transacciones`;
    
    // Hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const transaccionesHoy = transacciones.filter(t => {
        const fecha = new Date(t.fecha);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
    });
    const montoHoy = transaccionesHoy.reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);
    document.getElementById('transaccionesHoy').textContent = transaccionesHoy.length;
    document.getElementById('montoHoy').textContent = formatearMoneda(montoHoy);
}

// ============================================
// FILTROS
// ============================================

function handleTipoFilter(chip) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    
    filtros.tipo = chip.dataset.tipo;
    aplicarFiltros();
}

function handlePeriodoFilter(chip) {
    document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    
    const periodo = chip.dataset.periodo;
    filtros.periodo = periodo;
    
    const customDateGroup = document.getElementById('customDateGroup');
    if (periodo === 'custom') {
        customDateGroup.style.display = 'block';
    } else {
        customDateGroup.style.display = 'none';
        calcularRangoFechas(periodo);
        aplicarFiltros();
    }
}

function calcularRangoFechas(periodo) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    let desde = new Date(hoy);
    const hasta = new Date(hoy);
    hasta.setHours(23, 59, 59, 999);
    
    switch (periodo) {
        case 'hoy':
            // Ya está configurado
            break;
        case 'semana':
            desde.setDate(hoy.getDate() - hoy.getDay()); // Inicio de semana
            break;
        case 'mes':
            desde.setDate(1); // Primer día del mes
            break;
    }
    
    filtros.fechaDesde = desde;
    filtros.fechaHasta = hasta;
}

function aplicarFechasPersonalizadas() {
    const desde = document.getElementById('fechaDesde').value;
    const hasta = document.getElementById('fechaHasta').value;
    
    if (!desde || !hasta) {
        mostrarError('Debe seleccionar ambas fechas');
        return;
    }
    
    filtros.fechaDesde = new Date(desde);
    filtros.fechaHasta = new Date(hasta);
    filtros.fechaHasta.setHours(23, 59, 59, 999);
    
    aplicarFiltros();
}

function aplicarFiltros() {
    // Obtener valores de filtros adicionales
    filtros.cuenta = document.getElementById('filtroCuenta').value;
    filtros.montoMin = parseFloat(document.getElementById('montoMin').value) || null;
    filtros.montoMax = parseFloat(document.getElementById('montoMax').value) || null;
    
    // Calcular fechas si aún no están configuradas
    if (!filtros.fechaDesde || !filtros.fechaHasta) {
        calcularRangoFechas(filtros.periodo);
    }
    
    // Filtrar transacciones
    let transaccionesFiltradas = transacciones.filter(t => {
        // Filtro por tipo
        if (filtros.tipo !== 'todos' && t.tipo !== filtros.tipo) {
            return false;
        }
        
        // Filtro por fecha
        const fecha = new Date(t.fecha);
        if (filtros.fechaDesde && fecha < filtros.fechaDesde) {
            return false;
        }
        if (filtros.fechaHasta && fecha > filtros.fechaHasta) {
            return false;
        }
        
        // Filtro por cuenta
        if (filtros.cuenta !== 'todas' && t.id_cuenta !== parseInt(filtros.cuenta)) {
            return false;
        }
        
        // Filtro por monto
        const monto = parseFloat(t.monto);
        if (filtros.montoMin !== null && monto < filtros.montoMin) {
            return false;
        }
        if (filtros.montoMax !== null && monto > filtros.montoMax) {
            return false;
        }
        
        return true;
    });
    
    // Actualizar contador
    document.getElementById('resultsCount').textContent = 
        `${transaccionesFiltradas.length} transacciones encontradas`;
    
    // Resetear paginación
    paginaActual = 1;
    
    // Renderizar
    renderizarTransacciones(transaccionesFiltradas);
}

function limpiarFiltros() {
    // Resetear UI
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.filter-chip[data-tipo="todos"]').classList.add('active');
    
    document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.date-chip[data-periodo="hoy"]').classList.add('active');
    
    document.getElementById('filtroCuenta').value = 'todas';
    document.getElementById('montoMin').value = '';
    document.getElementById('montoMax').value = '';
    document.getElementById('fechaDesde').value = '';
    document.getElementById('fechaHasta').value = '';
    document.getElementById('customDateGroup').style.display = 'none';
    
    // Resetear filtros
    filtros = {
        tipo: 'todos',
        periodo: 'hoy',
        fechaDesde: null,
        fechaHasta: null,
        cuenta: 'todas',
        montoMin: null,
        montoMax: null
    };
    
    aplicarFiltros();
}

function handleGlobalSearch(e) {
    const busqueda = e.target.value.toLowerCase().trim();
    
    if (!busqueda) {
        aplicarFiltros();
        return;
    }
    
    const transaccionesFiltradas = transacciones.filter(t => {
        const cuenta = obtenerNumeroCuenta(t.id_cuenta).toLowerCase();
        const titular = obtenerTitularCuenta(t.id_cuenta).toLowerCase();
        const descripcion = (t.descripcion || '').toLowerCase();
        const id = t.id.toString();
        
        return cuenta.includes(busqueda) || 
               titular.includes(busqueda) || 
               descripcion.includes(busqueda) ||
               id.includes(busqueda);
    });
    
    document.getElementById('resultsCount').textContent = 
        `${transaccionesFiltradas.length} transacciones encontradas`;
    
    paginaActual = 1;
    renderizarTransacciones(transaccionesFiltradas);
}

// ============================================
// RENDERIZAR TABLA
// ============================================

function renderizarTransacciones(transaccionesFiltradas) {
    const tbody = document.getElementById('transaccionesTableBody');
    
    if (transaccionesFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <p style="color: #6B7280; font-size: 1rem;">No se encontraron transacciones</p>
                </td>
            </tr>
        `;
        actualizarPaginacion(0);
        return;
    }
    
    // Calcular paginación
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const transaccionesPagina = transaccionesFiltradas.slice(inicio, fin);
    
    tbody.innerHTML = transaccionesPagina.map(t => {
        const tipoClass = `tipo-${t.tipo}`;
        const montoClass = t.tipo === 'deposito' ? 'monto-positivo' : 
                          t.tipo === 'retiro' ? 'monto-negativo' : 'monto-neutral';
        const signo = t.tipo === 'deposito' ? '+' : t.tipo === 'retiro' ? '-' : '';
        
        return `
            <tr>
                <td><strong>#${t.id}</strong></td>
                <td>${formatearFechaHora(t.fecha)}</td>
                <td>
                    <span class="${tipoClass}">
                        ${obtenerIconoTipo(t.tipo)} ${capitalizar(t.tipo)}
                    </span>
                </td>
                <td>${obtenerNumeroCuenta(t.id_cuenta)}</td>
                <td>${obtenerTitularCuenta(t.id_cuenta)}</td>
                <td class="${montoClass}">${signo} ${formatearMoneda(t.monto)}</td>
                <td>${formatearMoneda(t.saldo_despues || 0)}</td>
                <td>${t.descripcion || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="verDetalles(${t.id})" title="Ver detalles">
                            👁️
                        </button>
                        <button class="action-btn btn-edit" onclick="imprimirTransaccion(${t.id})" title="Imprimir">
                            🖨️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    actualizarPaginacion(transaccionesFiltradas.length);
}

function actualizarPaginacion(totalItems) {
    const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
    
    document.getElementById('currentPage').textContent = totalPaginas > 0 ? paginaActual : 0;
    document.getElementById('totalPages').textContent = totalPaginas;
    
    document.getElementById('btnPrevPage').disabled = paginaActual <= 1;
    document.getElementById('btnNextPage').disabled = paginaActual >= totalPaginas;
}

function paginaAnterior() {
    if (paginaActual > 1) {
        paginaActual--;
        aplicarFiltros();
    }
}

function paginaSiguiente() {
    const totalPaginas = Math.ceil(
        parseInt(document.getElementById('resultsCount').textContent) / itemsPorPagina
    );
    
    if (paginaActual < totalPaginas) {
        paginaActual++;
        aplicarFiltros();
    }
}

// ============================================
// MODAL NUEVA TRANSACCIÓN
// ============================================

function abrirModalNuevaTransaccion() {
    document.getElementById('formNuevaTransaccion').reset();
    document.getElementById('cuentaInfo').style.display = 'none';
    document.getElementById('seccionDestino').style.display = 'none';
    document.getElementById('previewBox').style.display = 'none';
    document.getElementById('modalNuevaTransaccion').classList.add('show');
}

function cerrarModalNuevaTransaccion() {
    document.getElementById('modalNuevaTransaccion').classList.remove('show');
}

function llenarSelectCuentas() {
    const select = document.getElementById('id_cuenta');
    const selectDestino = document.getElementById('id_cuenta_destino');
    
    select.innerHTML = '<option value="">Seleccionar cuenta...</option>';
    selectDestino.innerHTML = '<option value="">Seleccionar cuenta destino...</option>';
    
    cuentas
        .filter(c => c.estado === 'activa')
        .forEach(cuenta => {
            const option = document.createElement('option');
            option.value = cuenta.id;
            option.textContent = `${cuenta.numero_cuenta} - ${obtenerTitularCuenta(cuenta.id_socio)} (${formatearMoneda(cuenta.saldo)})`;
            select.appendChild(option);
            
            const optionDestino = option.cloneNode(true);
            selectDestino.appendChild(optionDestino);
        });
}

function llenarFiltroCuentas() {
    const select = document.getElementById('filtroCuenta');
    select.innerHTML = '<option value="todas">Todas las cuentas</option>';
    
    cuentas.forEach(cuenta => {
        const option = document.createElement('option');
        option.value = cuenta.id;
        option.textContent = `${cuenta.numero_cuenta} - ${obtenerTitularCuenta(cuenta.id_socio)}`;
        select.appendChild(option);
    });
}

function handleTipoTransaccionChange(e) {
    const tipo = e.target.value;
    const seccionDestino = document.getElementById('seccionDestino');
    
    if (tipo === 'transferencia') {
        seccionDestino.style.display = 'block';
        document.getElementById('id_cuenta_destino').required = true;
    } else {
        seccionDestino.style.display = 'none';
        document.getElementById('id_cuenta_destino').required = false;
    }
}

function mostrarInfoCuenta() {
    const idCuenta = parseInt(document.getElementById('id_cuenta').value);
    const infoBox = document.getElementById('cuentaInfo');
    
    if (!idCuenta) {
        infoBox.style.display = 'none';
        document.getElementById('previewBox').style.display = 'none';
        return;
    }
    
    const cuenta = cuentas.find(c => c.id === idCuenta);
    if (!cuenta) return;
    
    document.getElementById('infoCuentaNumero').textContent = cuenta.numero_cuenta;
    document.getElementById('infoCuentaTitular').textContent = obtenerTitularCuenta(cuenta.id_socio);
    document.getElementById('infoCuentaSaldo').textContent = formatearMoneda(cuenta.saldo);
    
    infoBox.style.display = 'block';
    actualizarPreviewSaldo();
}

function actualizarPreviewSaldo() {
    const idCuenta = parseInt(document.getElementById('id_cuenta').value);
    const monto = parseFloat(document.getElementById('monto').value) || 0;
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    
    if (!idCuenta || monto === 0) {
        document.getElementById('previewBox').style.display = 'none';
        return;
    }
    
    const cuenta = cuentas.find(c => c.id === idCuenta);
    if (!cuenta) return;
    
    const saldoActual = parseFloat(cuenta.saldo);
    let nuevoSaldo = saldoActual;
    
    if (tipo === 'deposito') {
        nuevoSaldo = saldoActual + monto;
    } else if (tipo === 'retiro') {
        nuevoSaldo = saldoActual - monto;
    }
    
    document.getElementById('previewSaldoActual').textContent = formatearMoneda(saldoActual);
    document.getElementById('previewNuevoSaldo').textContent = formatearMoneda(nuevoSaldo);
    
    // Cambiar color si quedaría negativo
    const previewValue = document.getElementById('previewNuevoSaldo');
    if (nuevoSaldo < 0) {
        previewValue.style.color = '#EF4444';
    } else {
        previewValue.style.color = '#10B981';
    }
    
    document.getElementById('previewBox').style.display = 'flex';
}

async function handleNuevaTransaccion(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const tipo = formData.get('tipo');
    const idCuenta = parseInt(formData.get('id_cuenta'));
    const monto = parseFloat(formData.get('monto'));
    const descripcion = formData.get('descripcion') || '';
    
    // Validaciones
    if (!idCuenta) {
        mostrarError('Debe seleccionar una cuenta');
        return;
    }
    
    if (monto <= 0) {
        mostrarError('El monto debe ser mayor a 0');
        return;
    }
    
    const cuenta = cuentas.find(c => c.id === idCuenta);
    if (tipo === 'retiro' && monto > parseFloat(cuenta.saldo)) {
        mostrarError('Fondos insuficientes');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        // Crear transacción
        const responseTransaccion = await fetch(`${API_URL}/api/transacciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id_cuenta: idCuenta,
                tipo: tipo,
                monto: monto,
                descripcion: descripcion
            })
        });
        
        if (!responseTransaccion.ok) {
            const error = await responseTransaccion.json();
            throw new Error(error.message || 'Error al crear transacción');
        }
        
        // Actualizar saldo de cuenta
        const nuevoSaldo = tipo === 'deposito' 
            ? parseFloat(cuenta.saldo) + monto 
            : parseFloat(cuenta.saldo) - monto;
        
        await fetch(`${API_URL}/api/cuentas/${idCuenta}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ saldo: nuevoSaldo })
        });
        
        // Si es transferencia, actualizar cuenta destino
        if (tipo === 'transferencia') {
            const idCuentaDestino = parseInt(formData.get('id_cuenta_destino'));
            const cuentaDestino = cuentas.find(c => c.id === idCuentaDestino);
            
            if (cuentaDestino) {
                const nuevoSaldoDestino = parseFloat(cuentaDestino.saldo) + monto;
                
                await fetch(`${API_URL}/api/cuentas/${idCuentaDestino}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ saldo: nuevoSaldoDestino })
                });
                
                // Crear transacción de depósito en cuenta destino
                await fetch(`${API_URL}/api/transacciones`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id_cuenta: idCuentaDestino,
                        tipo: 'deposito',
                        monto: monto,
                        descripcion: `Transferencia desde ${cuenta.numero_cuenta}`
                    })
                });
            }
        }
        
        mostrarExito('Transacción procesada exitosamente');
        cerrarModalNuevaTransaccion();
        cargarDatos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message || 'Error al procesar la transacción');
    }
}

// ============================================
// MODAL DETALLES
// ============================================

function verDetalles(idTransaccion) {
    const transaccion = transacciones.find(t => t.id === idTransaccion);
    if (!transaccion) return;
    
    // Configurar icono y título
    const icono = obtenerIconoTipo(transaccion.tipo);
    document.getElementById('detallesIcono').textContent = icono;
    document.getElementById('detallesTipo').textContent = capitalizar(transaccion.tipo);
    document.getElementById('detallesFecha').textContent = formatearFechaHora(transaccion.fecha);
    
    // Monto con signo
    const signo = transaccion.tipo === 'deposito' ? '+' : 
                  transaccion.tipo === 'retiro' ? '-' : '';
    document.getElementById('detallesMonto').textContent = signo + ' ' + formatearMoneda(transaccion.monto);
    
    // Información detallada
    const detallesHTML = `
        <div class="detalle-item">
            <div class="detalle-label">ID Transacción</div>
            <div class="detalle-value">#${transaccion.id}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Tipo</div>
            <div class="detalle-value">${capitalizar(transaccion.tipo)}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Fecha y Hora</div>
            <div class="detalle-value">${formatearFechaHora(transaccion.fecha)}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Cuenta</div>
            <div class="detalle-value">${obtenerNumeroCuenta(transaccion.id_cuenta)}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Titular</div>
            <div class="detalle-value">${obtenerTitularCuenta(transaccion.id_cuenta)}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Monto</div>
            <div class="detalle-value">${signo} ${formatearMoneda(transaccion.monto)}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Saldo Después</div>
            <div class="detalle-value">${formatearMoneda(transaccion.saldo_despues || 0)}</div>
        </div>
        ${transaccion.descripcion ? `
            <div class="detalle-item" style="grid-column: 1 / -1;">
                <div class="detalle-label">Descripción</div>
                <div class="detalle-value">${transaccion.descripcion}</div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('detallesContenido').innerHTML = detallesHTML;
    document.getElementById('modalDetalles').classList.add('show');
}

function cerrarModalDetalles() {
    document.getElementById('modalDetalles').classList.remove('show');
}

function imprimirRecibo() {
    window.print();
}

function imprimirTransaccion(idTransaccion) {
    verDetalles(idTransaccion);
    setTimeout(() => {
        window.print();
    }, 500);
}

// ============================================
// EXPORTAR
// ============================================

function exportarCSV() {
    const csv = generarCSV();
    descargarArchivo(csv, 'transacciones.csv', 'text/csv');
    mostrarExito('Transacciones exportadas a CSV');
}

function exportarPDF() {
    mostrarExito('Función de exportar PDF en desarrollo');
}

function generarCSV() {
    const headers = ['ID', 'Fecha', 'Tipo', 'Cuenta', 'Titular', 'Monto', 'Saldo Después', 'Descripción'];
    const rows = transacciones.map(t => [
        t.id,
        formatearFechaHora(t.fecha),
        capitalizar(t.tipo),
        obtenerNumeroCuenta(t.id_cuenta),
        obtenerTitularCuenta(t.id_cuenta),
        t.monto,
        t.saldo_despues || 0,
        t.descripcion || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function descargarArchivo(contenido, nombreArchivo, tipoMime) {
    const blob = new Blob([contenido], { type: tipoMime + ';charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', nombreArchivo);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// UTILIDADES
// ============================================

function obtenerNumeroCuenta(idCuenta) {
    const cuenta = cuentas.find(c => c.id === idCuenta);
    return cuenta ? cuenta.numero_cuenta : 'N/A';
}

function obtenerTitularCuenta(idSocio) {
    const socio = socios.find(s => s.id === idSocio);
    return socio ? `${socio.nombre} ${socio.apellido}` : 'Desconocido';
}

function obtenerIconoTipo(tipo) {
    const iconos = {
        'deposito': '⬇️',
        'retiro': '⬆️',
        'transferencia': '💱'
    };
    return iconos[tipo] || '💰';
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
        minute: '2-digit',
        second: '2-digit'
    });
}

function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function showLoading(show) {
    const tbody = document.getElementById('transaccionesTableBody');
    if (show) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="9">
                    <div class="loading-spinner"></div>
                    <p>Cargando transacciones...</p>
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

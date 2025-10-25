// ============================================
// PAGOS - FUNCIONALIDAD COMPLETA
// ============================================

// Configuración de API
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://coop-smart.vercel.app';

// Estado de la aplicación
let prestamos = [];
let pagos = [];
let socios = [];
let filtros = {
    estado: 'todos',
    periodo: 'mes',
    fechaDesde: null,
    fechaHasta: null,
    prestamo: 'todos',
    socio: 'todos'
};

// Paginación
let paginaActualPrestamos = 1;
let paginaActualPagos = 1;
const itemsPorPagina = 20;

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarUsuario();
    initEventListeners();
    cargarDatos();
    
    // Fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_pago').value = hoy;
    
    // Auto-refresh cada 60 segundos
    setInterval(() => {
        cargarDatos();
    }, 60000);
});

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
}

function cargarUsuario() {
    const nombre = localStorage.getItem('nombre') || 'Admin';
    const rol = localStorage.getItem('rol') || 'Administrador';
    
    document.getElementById('userName').textContent = nombre;
    document.getElementById('userRole').textContent = rol;
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
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => handleEstadoFilter(e.target));
    });
    
    document.querySelectorAll('.date-chip').forEach(chip => {
        chip.addEventListener('click', (e) => handlePeriodoFilter(e.target));
    });
    
    document.getElementById('btnAplicarFechas').addEventListener('click', aplicarFechasPersonalizadas);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    
    document.getElementById('filtroPrestamo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroSocio').addEventListener('change', aplicarFiltros);
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => cambiarTab(e.target.dataset.tab));
    });
    
    // Botón Registrar Pago
    document.getElementById('btnRegistrarPago').addEventListener('click', abrirModalRegistrarPago);
    
    // Exportar
    document.getElementById('btnExportarPrestamos').addEventListener('click', exportarPrestamos);
    document.getElementById('btnExportarPagos').addEventListener('click', exportarPagos);
    
    // Modal Registrar Pago
    document.getElementById('btnCloseRegistrar').addEventListener('click', cerrarModalRegistrarPago);
    document.getElementById('btnCancelarRegistrar').addEventListener('click', cerrarModalRegistrarPago);
    document.getElementById('formRegistrarPago').addEventListener('submit', handleRegistrarPago);
    document.getElementById('id_prestamo').addEventListener('change', mostrarInfoPrestamo);
    document.getElementById('monto_pagado').addEventListener('input', calcularDistribucion);
    
    // Modal Plan de Pagos
    document.getElementById('btnClosePlan').addEventListener('click', cerrarModalPlanPagos);
    document.getElementById('btnCerrarPlan').addEventListener('click', cerrarModalPlanPagos);
    document.getElementById('btnImprimirPlan').addEventListener('click', imprimirPlan);
    
    // Modal Recibo
    document.getElementById('btnCloseRecibo').addEventListener('click', cerrarModalRecibo);
    document.getElementById('btnCerrarRecibo').addEventListener('click', cerrarModalRecibo);
    document.getElementById('btnImprimirRecibo').addEventListener('click', imprimirRecibo);
    
    // Paginación
    document.getElementById('btnPrevPagePrestamos').addEventListener('click', () => cambiarPagina('prestamos', -1));
    document.getElementById('btnNextPagePrestamos').addEventListener('click', () => cambiarPagina('prestamos', 1));
    document.getElementById('btnPrevPagePagos').addEventListener('click', () => cambiarPagina('pagos', -1));
    document.getElementById('btnNextPagePagos').addEventListener('click', () => cambiarPagina('pagos', 1));
    
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
        cargarPrestamos(),
        cargarPagos()
    ]);
}

async function cargarPrestamos() {
    try {
        showLoading('prestamos', true);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/prestamos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar préstamos');
        
        prestamos = await response.json();
        
        llenarFiltroPrestamos();
        actualizarEstadisticas();
        aplicarFiltros();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los préstamos');
    } finally {
        showLoading('prestamos', false);
    }
}

async function cargarPagos() {
    try {
        showLoading('pagos', true);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/pagos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar pagos');
        
        pagos = await response.json();
        
        // Ordenar por fecha descendente
        pagos.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));
        
        renderizarPagos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los pagos');
    } finally {
        showLoading('pagos', false);
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
        llenarFiltroSocios();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============================================
// ESTADÍSTICAS
// ============================================

function actualizarEstadisticas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Pagos de hoy
    const pagosHoy = pagos.filter(p => {
        const fecha = new Date(p.fecha_pago);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
    });
    
    const totalHoy = pagosHoy.reduce((sum, p) => sum + parseFloat(p.monto_pagado || 0), 0);
    document.getElementById('totalRecaudadoHoy').textContent = formatearMoneda(totalHoy);
    document.getElementById('countPagosHoy').textContent = `${pagosHoy.length} pagos`;
    
    // Préstamos activos
    const prestamosActivos = prestamos.filter(p => p.estado === 'aprobado');
    
    // Préstamos al día
    const alDia = prestamosActivos.filter(p => {
        const estado = calcularEstadoPrestamo(p);
        return estado === 'al_dia';
    });
    document.getElementById('prestamosAlDia').textContent = alDia.length;
    document.getElementById('percentAlDia').textContent = 
        `${prestamosActivos.length > 0 ? Math.round((alDia.length / prestamosActivos.length) * 100) : 0}% del total`;
    
    // Pagos próximos (7 días)
    const proximos7Dias = new Date();
    proximos7Dias.setDate(proximos7Dias.getDate() + 7);
    
    const proximosPagos = prestamosActivos.filter(p => {
        const proximoPago = calcularProximoPago(p);
        return proximoPago && new Date(proximoPago) <= proximos7Dias;
    });
    
    const montoProximo = proximosPagos.reduce((sum, p) => sum + parseFloat(p.cuota_mensual || 0), 0);
    document.getElementById('pagosProximos').textContent = proximosPagos.length;
    document.getElementById('montoProximo').textContent = formatearMoneda(montoProximo) + ' estimado';
    
    // En mora
    const enMora = prestamosActivos.filter(p => {
        const estado = calcularEstadoPrestamo(p);
        return estado === 'mora';
    });
    
    const montoMora = enMora.reduce((sum, p) => {
        const pagosRealizados = pagos.filter(pg => pg.id_prestamo === p.id);
        const totalPagado = pagosRealizados.reduce((s, pg) => s + parseFloat(pg.monto_pagado || 0), 0);
        const cuotasDebidas = Math.floor(calcularMesesTranscurridos(p.fecha_aprobacion) + 1);
        const debeTotal = Math.min(cuotasDebidas, p.plazo_meses) * parseFloat(p.cuota_mensual);
        return sum + Math.max(0, debeTotal - totalPagado);
    }, 0);
    
    document.getElementById('prestamosMora').textContent = enMora.length;
    document.getElementById('montoMora').textContent = formatearMoneda(montoMora) + ' atrasado';
}

// ============================================
// FILTROS
// ============================================

function handleEstadoFilter(chip) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    
    filtros.estado = chip.dataset.estado;
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
        case 'mes':
            desde.setDate(1);
            break;
        case 'trimestre':
            desde.setMonth(hoy.getMonth() - 3);
            break;
        case 'semestre':
            desde.setMonth(hoy.getMonth() - 6);
            break;
        case 'anio':
            desde.setFullYear(hoy.getFullYear(), 0, 1);
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
    filtros.prestamo = document.getElementById('filtroPrestamo').value;
    filtros.socio = document.getElementById('filtroSocio').value;
    
    // Calcular fechas si no están configuradas
    if (!filtros.fechaDesde || !filtros.fechaHasta) {
        calcularRangoFechas(filtros.periodo);
    }
    
    // Filtrar préstamos activos
    let prestamosFiltrados = prestamos.filter(p => p.estado === 'aprobado');
    
    // Filtro por estado
    if (filtros.estado !== 'todos') {
        prestamosFiltrados = prestamosFiltrados.filter(p => {
            const estado = calcularEstadoPrestamo(p);
            return estado === filtros.estado;
        });
    }
    
    // Filtro por préstamo
    if (filtros.prestamo !== 'todos') {
        prestamosFiltrados = prestamosFiltrados.filter(p => p.id === parseInt(filtros.prestamo));
    }
    
    // Filtro por socio
    if (filtros.socio !== 'todos') {
        prestamosFiltrados = prestamosFiltrados.filter(p => p.id_socio === parseInt(filtros.socio));
    }
    
    // Resetear paginación
    paginaActualPrestamos = 1;
    
    // Renderizar
    renderizarPrestamos(prestamosFiltrados);
    renderizarPendientes();
}

function limpiarFiltros() {
    // Resetear UI
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.filter-chip[data-estado="todos"]').classList.add('active');
    
    document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.date-chip[data-periodo="mes"]').classList.add('active');
    
    document.getElementById('filtroPrestamo').value = 'todos';
    document.getElementById('filtroSocio').value = 'todos';
    document.getElementById('fechaDesde').value = '';
    document.getElementById('fechaHasta').value = '';
    document.getElementById('customDateGroup').style.display = 'none';
    
    // Resetear filtros
    filtros = {
        estado: 'todos',
        periodo: 'mes',
        fechaDesde: null,
        fechaHasta: null,
        prestamo: 'todos',
        socio: 'todos'
    };
    
    aplicarFiltros();
}

function handleGlobalSearch(e) {
    const busqueda = e.target.value.toLowerCase().trim();
    
    if (!busqueda) {
        aplicarFiltros();
        return;
    }
    
    const prestamosFiltrados = prestamos.filter(p => {
        const socio = obtenerNombreSocio(p.id_socio).toLowerCase();
        const id = p.id.toString();
        
        return socio.includes(busqueda) || id.includes(busqueda);
    });
    
    paginaActualPrestamos = 1;
    renderizarPrestamos(prestamosFiltrados);
}

// ============================================
// TABS
// ============================================

function cambiarTab(tab) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
    
    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`tab${capitalizar(tab)}`).classList.add('active');
    
    // Cargar datos según tab
    if (tab === 'pendientes') {
        renderizarPendientes();
    }
}

// ============================================
// RENDERIZAR PRÉSTAMOS
// ============================================

function renderizarPrestamos(prestamosFiltrados) {
    const tbody = document.getElementById('prestamosTableBody');
    
    if (prestamosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <p style="color: #6B7280; font-size: 1rem;">No se encontraron préstamos</p>
                </td>
            </tr>
        `;
        document.getElementById('resultsCountPrestamos').textContent = '0 préstamos';
        return;
    }
    
    document.getElementById('resultsCountPrestamos').textContent = `${prestamosFiltrados.length} préstamos`;
    
    // Paginación
    const inicio = (paginaActualPrestamos - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const prestamosPagina = prestamosFiltrados.slice(inicio, fin);
    
    tbody.innerHTML = prestamosPagina.map(p => {
        const estadoPrestamo = calcularEstadoPrestamo(p);
        const saldoPendiente = calcularSaldoPendiente(p);
        const progreso = calcularProgreso(p);
        const proximoPago = calcularProximoPago(p);
        
        return `
            <tr>
                <td><strong>#${p.id}</strong></td>
                <td>${obtenerNombreSocio(p.id_socio)}</td>
                <td>${formatearMoneda(p.monto)}</td>
                <td><strong>${formatearMoneda(saldoPendiente)}</strong></td>
                <td>${formatearMoneda(p.cuota_mensual)}</td>
                <td>${proximoPago ? formatearFecha(proximoPago) : '-'}</td>
                <td>
                    <span class="estado-${estadoPrestamo}">
                        ${obtenerTextoEstado(estadoPrestamo)}
                    </span>
                </td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar-fill" style="width: ${progreso}%">
                            ${progreso}%
                        </div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="verPlanPagos(${p.id})" title="Ver plan">
                            📊
                        </button>
                        <button class="action-btn btn-pay" onclick="registrarPagoRapido(${p.id})" title="Pagar">
                            💰
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    actualizarPaginacion('prestamos', prestamosFiltrados.length);
}

// ============================================
// RENDERIZAR PAGOS
// ============================================

function renderizarPagos() {
    const tbody = document.getElementById('pagosTableBody');
    
    if (pagos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <p style="color: #6B7280; font-size: 1rem;">No hay pagos registrados</p>
                </td>
            </tr>
        `;
        document.getElementById('resultsCountPagos').textContent = '0 pagos';
        return;
    }
    
    document.getElementById('resultsCountPagos').textContent = `${pagos.length} pagos`;
    
    // Paginación
    const inicio = (paginaActualPagos - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const pagosPagina = pagos.slice(inicio, fin);
    
    tbody.innerHTML = pagosPagina.map(pago => {
        const prestamo = prestamos.find(p => p.id === pago.id_prestamo);
        
        return `
            <tr>
                <td><strong>#${pago.id}</strong></td>
                <td>${formatearFechaHora(pago.fecha_pago)}</td>
                <td>#${pago.id_prestamo}</td>
                <td>${prestamo ? obtenerNombreSocio(prestamo.id_socio) : 'N/A'}</td>
                <td><strong>${pago.numero_cuota}</strong></td>
                <td>${formatearMoneda(pago.monto_pagado)}</td>
                <td>${formatearMoneda(pago.monto_capital || 0)}</td>
                <td>${formatearMoneda(pago.monto_interes || 0)}</td>
                <td>
                    <span style="text-transform: capitalize;">
                        ${obtenerIconoMetodo(pago.metodo_pago)} ${pago.metodo_pago}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="verRecibo(${pago.id})" title="Ver recibo">
                            🧾
                        </button>
                        <button class="action-btn btn-print" onclick="imprimirPagoDirecto(${pago.id})" title="Imprimir">
                            🖨️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    actualizarPaginacion('pagos', pagos.length);
}

// ============================================
// RENDERIZAR PENDIENTES
// ============================================

function renderizarPendientes() {
    const tbody = document.getElementById('pendientesTableBody');
    
    const prestamosActivos = prestamos.filter(p => p.estado === 'aprobado');
    
    let cuotasPendientes = [];
    
    prestamosActivos.forEach(prestamo => {
        const pagosRealizados = pagos.filter(p => p.id_prestamo === prestamo.id).length;
        const cuotasRestantes = prestamo.plazo_meses - pagosRealizados;
        
        if (cuotasRestantes > 0) {
            // Calcular cuotas pendientes
            for (let i = 1; i <= Math.min(cuotasRestantes, 3); i++) {
                const numeroCuota = pagosRealizados + i;
                const fechaVencimiento = calcularFechaVencimiento(prestamo, numeroCuota);
                const diasHastaVenc = calcularDiasHasta(fechaVencimiento);
                
                cuotasPendientes.push({
                    prestamo: prestamo,
                    numeroCuota: numeroCuota,
                    fechaVencimiento: fechaVencimiento,
                    diasHastaVenc: diasHastaVenc,
                    monto: parseFloat(prestamo.cuota_mensual),
                    capital: calcularCapitalCuota(prestamo, numeroCuota),
                    interes: calcularInteresCuota(prestamo, numeroCuota)
                });
            }
        }
    });
    
    // Ordenar por fecha de vencimiento
    cuotasPendientes.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));
    
    if (cuotasPendientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                    <p style="color: #6B7280; font-size: 1rem;">No hay cuotas pendientes próximas</p>
                </td>
            </tr>
        `;
        document.getElementById('resultsCountPendientes').textContent = '0 cuotas';
        return;
    }
    
    document.getElementById('resultsCountPendientes').textContent = `${cuotasPendientes.length} cuotas`;
    
    tbody.innerHTML = cuotasPendientes.map(c => {
        let estadoCuota = 'pendiente';
        let diasTexto = '';
        
        if (c.diasHastaVenc < 0) {
            estadoCuota = 'mora';
            diasTexto = `${Math.abs(c.diasHastaVenc)} días vencido`;
        } else if (c.diasHastaVenc === 0) {
            estadoCuota = 'proximo';
            diasTexto = 'Vence hoy';
        } else if (c.diasHastaVenc <= 7) {
            estadoCuota = 'proximo';
            diasTexto = `${c.diasHastaVenc} días`;
        } else {
            diasTexto = `${c.diasHastaVenc} días`;
        }
        
        return `
            <tr>
                <td><strong>#${c.prestamo.id}</strong></td>
                <td>${obtenerNombreSocio(c.prestamo.id_socio)}</td>
                <td><strong>${c.numeroCuota} / ${c.prestamo.plazo_meses}</strong></td>
                <td>${formatearFecha(c.fechaVencimiento)}</td>
                <td>${formatearMoneda(c.monto)}</td>
                <td>${formatearMoneda(c.capital)}</td>
                <td>${formatearMoneda(c.interes)}</td>
                <td>${diasTexto}</td>
                <td>
                    <span class="estado-${estadoCuota}">
                        ${obtenerTextoEstado(estadoCuota)}
                    </span>
                </td>
                <td>
                    <button class="action-btn btn-pay" onclick="pagarCuotaPendiente(${c.prestamo.id}, ${c.numeroCuota})" title="Pagar">
                        💰 Pagar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// MODAL REGISTRAR PAGO
// ============================================

function abrirModalRegistrarPago() {
    document.getElementById('formRegistrarPago').reset();
    document.getElementById('prestamoInfo').style.display = 'none';
    llenarSelectPrestamos();
    
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_pago').value = hoy;
    
    document.getElementById('modalRegistrarPago').classList.add('show');
}

function cerrarModalRegistrarPago() {
    document.getElementById('modalRegistrarPago').classList.remove('show');
}

function llenarSelectPrestamos() {
    const select = document.getElementById('id_prestamo');
    select.innerHTML = '<option value="">Seleccionar préstamo...</option>';
    
    const prestamosActivos = prestamos.filter(p => p.estado === 'aprobado');
    
    prestamosActivos.forEach(prestamo => {
        const saldo = calcularSaldoPendiente(prestamo);
        if (saldo > 0) {
            const option = document.createElement('option');
            option.value = prestamo.id;
            option.textContent = `#${prestamo.id} - ${obtenerNombreSocio(prestamo.id_socio)} (${formatearMoneda(saldo)} pendiente)`;
            select.appendChild(option);
        }
    });
}

function llenarFiltroPrestamos() {
    const select = document.getElementById('filtroPrestamo');
    select.innerHTML = '<option value="todos">Todos los préstamos</option>';
    
    prestamos.forEach(prestamo => {
        const option = document.createElement('option');
        option.value = prestamo.id;
        option.textContent = `#${prestamo.id} - ${obtenerNombreSocio(prestamo.id_socio)}`;
        select.appendChild(option);
    });
}

function llenarFiltroSocios() {
    const select = document.getElementById('filtroSocio');
    select.innerHTML = '<option value="todos">Todos los socios</option>';
    
    socios.forEach(socio => {
        const option = document.createElement('option');
        option.value = socio.id;
        option.textContent = `${socio.nombre} ${socio.apellido}`;
        select.appendChild(option);
    });
}

function mostrarInfoPrestamo() {
    const idPrestamo = parseInt(document.getElementById('id_prestamo').value);
    const infoBox = document.getElementById('prestamoInfo');
    
    if (!idPrestamo) {
        infoBox.style.display = 'none';
        return;
    }
    
    const prestamo = prestamos.find(p => p.id === idPrestamo);
    if (!prestamo) return;
    
    const pagosRealizados = pagos.filter(p => p.id_prestamo === idPrestamo);
    const saldoPendiente = calcularSaldoPendiente(prestamo);
    const cuotasPagadas = pagosRealizados.length;
    const cuotasRestantes = prestamo.plazo_meses - cuotasPagadas;
    
    document.getElementById('infoPrestamoSocio').textContent = obtenerNombreSocio(prestamo.id_socio);
    document.getElementById('infoPrestamoMonto').textContent = formatearMoneda(prestamo.monto);
    document.getElementById('infoPrestamoSaldo').textContent = formatearMoneda(saldoPendiente);
    document.getElementById('infoPrestamoCuota').textContent = formatearMoneda(prestamo.cuota_mensual);
    document.getElementById('infoPrestamoPagados').textContent = `${cuotasPagadas} cuotas`;
    document.getElementById('infoPrestamoRestantes').textContent = `${cuotasRestantes} cuotas`;
    
    // Autocompletar número de cuota y monto
    document.getElementById('numero_cuota').value = cuotasPagadas + 1;
    document.getElementById('monto_pagado').value = parseFloat(prestamo.cuota_mensual).toFixed(2);
    
    calcularDistribucion();
    
    infoBox.style.display = 'block';
}

function calcularDistribucion() {
    const idPrestamo = parseInt(document.getElementById('id_prestamo').value);
    const numeroCuota = parseInt(document.getElementById('numero_cuota').value);
    const montoPagado = parseFloat(document.getElementById('monto_pagado').value) || 0;
    
    if (!idPrestamo || !numeroCuota) return;
    
    const prestamo = prestamos.find(p => p.id === idPrestamo);
    if (!prestamo) return;
    
    const capital = calcularCapitalCuota(prestamo, numeroCuota);
    const interes = calcularInteresCuota(prestamo, numeroCuota);
    
    // Si el monto pagado es diferente a la cuota, ajustar proporcionalmente
    const cuotaTotal = capital + interes;
    let capitalFinal = capital;
    let interesFinal = interes;
    
    if (Math.abs(montoPagado - cuotaTotal) > 0.01) {
        const proporcion = montoPagado / cuotaTotal;
        capitalFinal = capital * proporcion;
        interesFinal = interes * proporcion;
    }
    
    document.getElementById('monto_capital').value = capitalFinal.toFixed(2);
    document.getElementById('monto_interes').value = interesFinal.toFixed(2);
}

async function handleRegistrarPago(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const idPrestamo = parseInt(formData.get('id_prestamo'));
    const numeroCuota = parseInt(formData.get('numero_cuota'));
    const montoPagado = parseFloat(formData.get('monto_pagado'));
    const montoCapital = parseFloat(formData.get('monto_capital'));
    const montoInteres = parseFloat(formData.get('monto_interes'));
    const fechaPago = formData.get('fecha_pago');
    const metodoPago = formData.get('metodo_pago');
    const referencia = formData.get('referencia') || null;
    const notas = formData.get('notas') || null;
    
    // Validaciones
    if (!idPrestamo || !numeroCuota || !montoPagado || !metodoPago) {
        mostrarError('Complete todos los campos requeridos');
        return;
    }
    
    if (montoPagado <= 0) {
        mostrarError('El monto debe ser mayor a 0');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/api/pagos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id_prestamo: idPrestamo,
                numero_cuota: numeroCuota,
                monto_pagado: montoPagado,
                monto_capital: montoCapital,
                monto_interes: montoInteres,
                fecha_pago: fechaPago,
                metodo_pago: metodoPago,
                referencia: referencia,
                notas: notas
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al registrar pago');
        }
        
        const pagoCreado = await response.json();
        
        // Verificar si el préstamo está completamente pagado
        const prestamo = prestamos.find(p => p.id === idPrestamo);
        const pagosRealizados = pagos.filter(p => p.id_prestamo === idPrestamo).length + 1;
        
        if (pagosRealizados >= prestamo.plazo_meses) {
            // Actualizar estado del préstamo a "pagado"
            await fetch(`${API_URL}/api/prestamos/${idPrestamo}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: 'pagado' })
            });
        }
        
        mostrarExito('Pago registrado exitosamente');
        cerrarModalRegistrarPago();
        cargarDatos();
        
        // Mostrar recibo
        setTimeout(() => {
            verRecibo(pagoCreado.id);
        }, 500);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message || 'Error al registrar el pago');
    }
}

// ============================================
// FUNCIONES AUXILIARES DE PAGO
// ============================================

function registrarPagoRapido(idPrestamo) {
    abrirModalRegistrarPago();
    setTimeout(() => {
        document.getElementById('id_prestamo').value = idPrestamo;
        mostrarInfoPrestamo();
    }, 100);
}

function pagarCuotaPendiente(idPrestamo, numeroCuota) {
    abrirModalRegistrarPago();
    setTimeout(() => {
        document.getElementById('id_prestamo').value = idPrestamo;
        mostrarInfoPrestamo();
        document.getElementById('numero_cuota').value = numeroCuota;
        calcularDistribucion();
    }, 100);
}

// ============================================
// MODAL PLAN DE PAGOS
// ============================================

function verPlanPagos(idPrestamo) {
    const prestamo = prestamos.find(p => p.id === idPrestamo);
    if (!prestamo) return;
    
    const pagosDelPrestamo = pagos.filter(p => p.id_prestamo === idPrestamo);
    
    // Información del encabezado
    document.getElementById('planPrestamoId').textContent = `#${prestamo.id}`;
    document.getElementById('planSocio').textContent = obtenerNombreSocio(prestamo.id_socio);
    document.getElementById('planMonto').textContent = formatearMoneda(prestamo.monto);
    document.getElementById('planTasa').textContent = `${prestamo.tasa_interes}% anual`;
    document.getElementById('planPlazo').textContent = `${prestamo.plazo_meses} meses`;
    
    // Calcular totales
    const totalPagado = pagosDelPrestamo.reduce((sum, p) => sum + parseFloat(p.monto_pagado || 0), 0);
    const totalAPagar = parseFloat(prestamo.cuota_mensual) * prestamo.plazo_meses;
    const saldoPendiente = totalAPagar - totalPagado;
    const progreso = Math.round((totalPagado / totalAPagar) * 100);
    
    document.getElementById('planPagado').textContent = formatearMoneda(totalPagado);
    document.getElementById('planPendiente').textContent = formatearMoneda(saldoPendiente);
    document.getElementById('planProgress').style.width = progreso + '%';
    document.getElementById('planProgress').textContent = progreso + '%';
    
    // Generar tabla de amortización
    const tbody = document.getElementById('planPagosTableBody');
    let saldoRestante = parseFloat(prestamo.monto);
    const tasaMensual = parseFloat(prestamo.tasa_interes) / 100 / 12;
    
    let html = '';
    for (let i = 1; i <= prestamo.plazo_meses; i++) {
        const interes = saldoRestante * tasaMensual;
        const capital = parseFloat(prestamo.cuota_mensual) - interes;
        saldoRestante -= capital;
        
        const fechaVenc = calcularFechaVencimiento(prestamo, i);
        const pagoRealizado = pagosDelPrestamo.find(p => p.numero_cuota === i);
        
        let estado, fechaPago, acciones;
        if (pagoRealizado) {
            estado = '<span class="estado-pagado">✓ Pagado</span>';
            fechaPago = formatearFecha(pagoRealizado.fecha_pago);
            acciones = `<button class="action-btn btn-view" onclick="verRecibo(${pagoRealizado.id})">🧾</button>`;
        } else {
            const diasHasta = calcularDiasHasta(fechaVenc);
            if (diasHasta < 0) {
                estado = '<span class="estado-mora">⚠️ Vencido</span>';
            } else if (diasHasta <= 7) {
                estado = '<span class="estado-proximo">⏰ Próximo</span>';
            } else {
                estado = '<span class="estado-pendiente">⏳ Pendiente</span>';
            }
            fechaPago = '-';
            acciones = `<button class="action-btn btn-pay" onclick="pagarCuotaPendiente(${prestamo.id}, ${i})">💰 Pagar</button>`;
        }
        
        html += `
            <tr>
                <td><strong>${i}</strong></td>
                <td>${formatearFecha(fechaVenc)}</td>
                <td>${formatearMoneda(prestamo.cuota_mensual)}</td>
                <td>${formatearMoneda(capital)}</td>
                <td>${formatearMoneda(interes)}</td>
                <td>${formatearMoneda(Math.max(0, saldoRestante))}</td>
                <td>${estado}</td>
                <td>${fechaPago}</td>
                <td>${acciones}</td>
            </tr>
        `;
    }
    
    tbody.innerHTML = html;
    document.getElementById('modalPlanPagos').classList.add('show');
}

function cerrarModalPlanPagos() {
    document.getElementById('modalPlanPagos').classList.remove('show');
}

function imprimirPlan() {
    window.print();
}

// ============================================
// MODAL RECIBO
// ============================================

function verRecibo(idPago) {
    const pago = pagos.find(p => p.id === idPago);
    if (!pago) return;
    
    const prestamo = prestamos.find(p => p.id === pago.id_prestamo);
    if (!prestamo) return;
    
    document.getElementById('reciboNumero').textContent = `#${pago.id}`;
    
    const detallesHTML = `
        <div class="detalle-item">
            <div class="detalle-label">Fecha de Pago</div>
            <div class="detalle-value">${formatearFechaHora(pago.fecha_pago)}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Préstamo #</div>
            <div class="detalle-value">${prestamo.id}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Socio/Cliente</div>
            <div class="detalle-value">${obtenerNombreSocio(prestamo.id_socio)}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Cuota Número</div>
            <div class="detalle-value">${pago.numero_cuota} de ${prestamo.plazo_meses}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Monto Pagado</div>
            <div class="detalle-value"><strong style="font-size: 1.2rem; color: #10B981;">${formatearMoneda(pago.monto_pagado)}</strong></div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Capital</div>
            <div class="detalle-value">${formatearMoneda(pago.monto_capital || 0)}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Interés</div>
            <div class="detalle-value">${formatearMoneda(pago.monto_interes || 0)}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Método de Pago</div>
            <div class="detalle-value">${obtenerIconoMetodo(pago.metodo_pago)} ${capitalizar(pago.metodo_pago)}</div>
        </div>
        ${pago.referencia ? `
            <div class="detalle-item">
                <div class="detalle-label">Referencia</div>
                <div class="detalle-value">${pago.referencia}</div>
            </div>
        ` : ''}
        ${pago.notas ? `
            <div class="detalle-item" style="grid-column: 1 / -1;">
                <div class="detalle-label">Notas</div>
                <div class="detalle-value">${pago.notas}</div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('reciboDetalles').innerHTML = detallesHTML;
    document.getElementById('modalRecibo').classList.add('show');
}

function cerrarModalRecibo() {
    document.getElementById('modalRecibo').classList.remove('show');
}

function imprimirRecibo() {
    window.print();
}

function imprimirPagoDirecto(idPago) {
    verRecibo(idPago);
    setTimeout(() => {
        window.print();
    }, 500);
}

// ============================================
// CÁLCULOS
// ============================================

function calcularSaldoPendiente(prestamo) {
    const pagosDelPrestamo = pagos.filter(p => p.id_prestamo === prestamo.id);
    const totalPagado = pagosDelPrestamo.reduce((sum, p) => sum + parseFloat(p.monto_capital || 0), 0);
    return Math.max(0, parseFloat(prestamo.monto) - totalPagado);
}

function calcularProgreso(prestamo) {
    const pagosRealizados = pagos.filter(p => p.id_prestamo === prestamo.id).length;
    return Math.round((pagosRealizados / prestamo.plazo_meses) * 100);
}

function calcularEstadoPrestamo(prestamo) {
    const pagosRealizados = pagos.filter(p => p.id_prestamo === prestamo.id).length;
    
    // Si está completamente pagado
    if (pagosRealizados >= prestamo.plazo_meses) {
        return 'pagado';
    }
    
    // Calcular meses desde aprobación
    const mesesTranscurridos = calcularMesesTranscurridos(prestamo.fecha_aprobacion);
    const cuotasDebidas = Math.floor(mesesTranscurridos) + 1;
    
    // En mora (debe más de 1 cuota)
    if (cuotasDebidas > pagosRealizados + 1) {
        return 'mora';
    }
    
    // Próximo vencimiento (debe la siguiente cuota dentro de 7 días)
    const proximoPago = calcularProximoPago(prestamo);
    if (proximoPago) {
        const diasHasta = calcularDiasHasta(proximoPago);
        if (diasHasta >= 0 && diasHasta <= 7) {
            return 'proximo';
        }
    }
    
    // Al día
    return 'al_dia';
}

function calcularProximoPago(prestamo) {
    const pagosRealizados = pagos.filter(p => p.id_prestamo === prestamo.id).length;
    
    if (pagosRealizados >= prestamo.plazo_meses) {
        return null; // Ya está pagado completamente
    }
    
    return calcularFechaVencimiento(prestamo, pagosRealizados + 1);
}

function calcularFechaVencimiento(prestamo, numeroCuota) {
    const fechaAprobacion = new Date(prestamo.fecha_aprobacion);
    const fechaVenc = new Date(fechaAprobacion);
    fechaVenc.setMonth(fechaVenc.getMonth() + numeroCuota);
    return fechaVenc;
}

function calcularMesesTranscurridos(fechaInicio) {
    const inicio = new Date(fechaInicio);
    const ahora = new Date();
    
    const meses = (ahora.getFullYear() - inicio.getFullYear()) * 12 + 
                  (ahora.getMonth() - inicio.getMonth());
    
    return meses;
}

function calcularDiasHasta(fecha) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const objetivo = new Date(fecha);
    objetivo.setHours(0, 0, 0, 0);
    
    const diff = objetivo - hoy;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calcularCapitalCuota(prestamo, numeroCuota) {
    const tasaMensual = parseFloat(prestamo.tasa_interes) / 100 / 12;
    let saldo = parseFloat(prestamo.monto);
    
    for (let i = 1; i < numeroCuota; i++) {
        const interes = saldo * tasaMensual;
        const capital = parseFloat(prestamo.cuota_mensual) - interes;
        saldo -= capital;
    }
    
    const interes = saldo * tasaMensual;
    return parseFloat(prestamo.cuota_mensual) - interes;
}

function calcularInteresCuota(prestamo, numeroCuota) {
    const tasaMensual = parseFloat(prestamo.tasa_interes) / 100 / 12;
    let saldo = parseFloat(prestamo.monto);
    
    for (let i = 1; i < numeroCuota; i++) {
        const interes = saldo * tasaMensual;
        const capital = parseFloat(prestamo.cuota_mensual) - interes;
        saldo -= capital;
    }
    
    return saldo * tasaMensual;
}

// ============================================
// EXPORTAR
// ============================================

function exportarPrestamos() {
    const csv = generarCSVPrestamos();
    descargarArchivo(csv, 'prestamos_activos.csv', 'text/csv');
    mostrarExito('Préstamos exportados a CSV');
}

function exportarPagos() {
    const csv = generarCSVPagos();
    descargarArchivo(csv, 'historial_pagos.csv', 'text/csv');
    mostrarExito('Pagos exportados a CSV');
}

function generarCSVPrestamos() {
    const headers = ['ID', 'Socio', 'Monto', 'Saldo Pendiente', 'Cuota', 'Próximo Pago', 'Estado'];
    const rows = prestamos
        .filter(p => p.estado === 'aprobado')
        .map(p => [
            p.id,
            obtenerNombreSocio(p.id_socio),
            p.monto,
            calcularSaldoPendiente(p),
            p.cuota_mensual,
            calcularProximoPago(p) ? formatearFecha(calcularProximoPago(p)) : '-',
            obtenerTextoEstado(calcularEstadoPrestamo(p))
        ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generarCSVPagos() {
    const headers = ['ID', 'Fecha', 'Préstamo', 'Socio', 'Cuota', 'Monto', 'Capital', 'Interés', 'Método'];
    const rows = pagos.map(p => {
        const prestamo = prestamos.find(pr => pr.id === p.id_prestamo);
        return [
            p.id,
            formatearFechaHora(p.fecha_pago),
            p.id_prestamo,
            prestamo ? obtenerNombreSocio(prestamo.id_socio) : 'N/A',
            p.numero_cuota,
            p.monto_pagado,
            p.monto_capital || 0,
            p.monto_interes || 0,
            p.metodo_pago
        ];
    });
    
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
// PAGINACIÓN
// ============================================

function cambiarPagina(tipo, direccion) {
    if (tipo === 'prestamos') {
        paginaActualPrestamos += direccion;
        aplicarFiltros();
    } else if (tipo === 'pagos') {
        paginaActualPagos += direccion;
        renderizarPagos();
    }
}

function actualizarPaginacion(tipo, totalItems) {
    const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
    
    if (tipo === 'prestamos') {
        document.getElementById('currentPagePrestamos').textContent = totalPaginas > 0 ? paginaActualPrestamos : 0;
        document.getElementById('totalPagesPrestamos').textContent = totalPaginas;
        document.getElementById('btnPrevPagePrestamos').disabled = paginaActualPrestamos <= 1;
        document.getElementById('btnNextPagePrestamos').disabled = paginaActualPrestamos >= totalPaginas;
    } else if (tipo === 'pagos') {
        document.getElementById('currentPagePagos').textContent = totalPaginas > 0 ? paginaActualPagos : 0;
        document.getElementById('totalPagesPagos').textContent = totalPaginas;
        document.getElementById('btnPrevPagePagos').disabled = paginaActualPagos <= 1;
        document.getElementById('btnNextPagePagos').disabled = paginaActualPagos >= totalPaginas;
    }
}

// ============================================
// UTILIDADES
// ============================================

function obtenerNombreSocio(idSocio) {
    const socio = socios.find(s => s.id === idSocio);
    return socio ? `${socio.nombre} ${socio.apellido}` : 'Desconocido';
}

function obtenerTextoEstado(estado) {
    const textos = {
        'al_dia': '✓ Al Día',
        'proximo': '⏰ Próximo',
        'mora': '⚠️ En Mora',
        'pagado': '✓ Pagado',
        'pendiente': '⏳ Pendiente'
    };
    return textos[estado] || estado;
}

function obtenerIconoMetodo(metodo) {
    const iconos = {
        'efectivo': '💵',
        'transferencia': '🏦',
        'cheque': '📝',
        'tarjeta': '💳'
    };
    return iconos[metodo] || '💰';
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

function showLoading(tipo, show) {
    let tbody;
    if (tipo === 'prestamos') {
        tbody = document.getElementById('prestamosTableBody');
    } else if (tipo === 'pagos') {
        tbody = document.getElementById('pagosTableBody');
    }
    
    if (show && tbody) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="10">
                    <div class="loading-spinner"></div>
                    <p>Cargando datos...</p>
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
        localStorage.removeItem('nombre');
        localStorage.removeItem('rol');
        window.location.href = 'login.html';
    }
}

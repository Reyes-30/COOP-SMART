// Configuración y constantes
const API_URL = 'http://localhost:3000/api';
let chartInstances = {}; // Almacenar instancias de gráficas para poder destruirlas
let datosActualesReporte = null; // Datos del reporte actual para exportación

// =======================================
// INICIALIZACIÓN
// =======================================
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    inicializarEventos();
    establecerFechasDefault();
});

// Verificar autenticación
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Mostrar información del usuario en el header
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) {
        userNameElement.textContent = usuario.nombre || 'Usuario';
    }
    if (userRoleElement) {
        userRoleElement.textContent = usuario.rol || 'N/A';
    }
}

// Inicializar eventos
function inicializarEventos() {
    const btnGenerar = document.getElementById('btn-generar-reporte');
    const btnPDF = document.getElementById('btn-exportar-pdf');
    const btnExcel = document.getElementById('btn-exportar-excel');
    const btnLogout = document.getElementById('logoutBtn');
    
    if (btnGenerar) {
        btnGenerar.addEventListener('click', generarReporte);
    }
    if (btnPDF) {
        btnPDF.addEventListener('click', exportarPDF);
    }
    if (btnExcel) {
        btnExcel.addEventListener('click', exportarExcel);
    }
    if (btnLogout) {
        btnLogout.addEventListener('click', cerrarSesion);
    }
}

// Establecer fechas por defecto (mes actual)
function establecerFechasDefault() {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    document.getElementById('filtro-fecha-inicio').value = primerDia.toISOString().split('T')[0];
    document.getElementById('filtro-fecha-fin').value = ultimoDia.toISOString().split('T')[0];
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    }
}

// =======================================
// GENERAR REPORTE SEGÚN TIPO
// =======================================
async function generarReporte() {
    const tipoReporte = document.getElementById('tipo-reporte').value;
    const fechaInicio = document.getElementById('filtro-fecha-inicio').value;
    const fechaFin = document.getElementById('filtro-fecha-fin').value;

    // Ocultar todos los reportes
    ocultarTodosLosReportes();

    // Mostrar loading
    mostrarCargando();

    try {
        switch (tipoReporte) {
            case 'resumen':
                await cargarResumenFinanciero(fechaInicio, fechaFin);
                break;
            case 'socios':
                await cargarAnalisisSocios();
                break;
            case 'cuentas':
                await cargarCuentasPorTipo();
                break;
            case 'prestamos':
                await cargarPrestamosDetallado(fechaInicio, fechaFin);
                break;
            case 'mora':
                await cargarPrestamosEnMora();
                break;
            case 'pagos':
                await cargarPagosPorPeriodo(fechaInicio, fechaFin);
                break;
            case 'transacciones':
                await cargarTransaccionesPorTipo(fechaInicio, fechaFin);
                break;
            case 'evolucion':
                await cargarEvolucionSaldos(fechaInicio, fechaFin);
                break;
            case 'top-socios':
                await cargarTopSocios();
                break;
            case 'crecimiento':
                await cargarCrecimientoSocios();
                break;
        }
    } catch (error) {
        console.error('Error al generar reporte:', error);
        alert('Error al generar el reporte. Por favor, intenta nuevamente.');
    } finally {
        ocultarCargando();
    }
}

// =======================================
// FUNCIONES DE REPORTES INDIVIDUALES
// =======================================

// 1. Resumen Financiero
async function cargarResumenFinanciero(fechaInicio, fechaFin) {
    const response = await fetch(`${API_URL}/reportes/resumen-financiero?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const datos = await response.json();

    datosActualesReporte = { tipo: 'resumen', datos };

    // Actualizar tarjetas de estadísticas
    document.getElementById('total-socios-activos').textContent = datos.total_socios_activos || 0;
    document.getElementById('total-socios-general').textContent = `de ${datos.total_socios || 0} totales`;
    document.getElementById('total-cuentas-activas').textContent = datos.total_cuentas_activas || 0;
    document.getElementById('saldo-total-cuentas').textContent = formatearMoneda(datos.saldo_total_cuentas || 0);
    document.getElementById('prestamos-activos').textContent = datos.prestamos_activos || 0;
    document.getElementById('monto-prestamos').textContent = formatearMoneda(datos.monto_total_prestamos || 0);
    document.getElementById('prestamos-pendientes').textContent = datos.prestamos_pendientes || 0;
    document.getElementById('saldo-pendiente').textContent = formatearMoneda(datos.saldo_pendiente_total || 0);
    document.getElementById('total-pagos-periodo').textContent = formatearMoneda(datos.total_pagos_periodo || 0);
    document.getElementById('cantidad-pagos').textContent = datos.cantidad_pagos_periodo || 0;
    document.getElementById('total-depositos').textContent = formatearMoneda(datos.total_depositos || 0);
    document.getElementById('total-retiros').textContent = formatearMoneda(datos.total_retiros || 0);

    // Gráfica de Pagos
    destruirGrafica('chart-pagos-periodo');
    crearGraficaDona('chart-pagos-periodo', 
        ['Pagos Recibidos', 'Por Recibir'],
        [datos.total_pagos_periodo || 0, (datos.saldo_pendiente_total || 0) - (datos.total_pagos_periodo || 0)],
        ['#27ae60', '#e74c3c']
    );

    // Gráfica de Transacciones
    destruirGrafica('chart-transacciones-periodo');
    crearGraficaDona('chart-transacciones-periodo',
        ['Depósitos', 'Retiros'],
        [datos.total_depositos || 0, datos.total_retiros || 0],
        ['#3498db', '#e67e22']
    );

    document.getElementById('fecha-reporte-resumen').textContent = `Generado: ${obtenerFechaHoraActual()}`;
    document.getElementById('reporte-resumen').style.display = 'block';
}

// 2. Análisis de Socios
async function cargarAnalisisSocios() {
    const [sociosPorEstado, crecimiento] = await Promise.all([
        fetch(`${API_URL}/reportes/socios-por-estado`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()),
        fetch(`${API_URL}/reportes/crecimiento`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json())
    ]);

    datosActualesReporte = { tipo: 'socios', sociosPorEstado, crecimiento };

    // Gráfica de estado
    destruirGrafica('chart-socios-estado');
    crearGraficaDona('chart-socios-estado',
        sociosPorEstado.map(s => s.estado),
        sociosPorEstado.map(s => s.cantidad),
        ['#27ae60', '#e74c3c', '#95a5a6']
    );

    // Gráfica de crecimiento
    destruirGrafica('chart-crecimiento');
    crearGraficaLinea('chart-crecimiento',
        crecimiento.map(c => c.mes),
        crecimiento.map(c => c.nuevos_socios),
        'Nuevos Socios'
    );

    document.getElementById('fecha-reporte-socios').textContent = `Generado: ${obtenerFechaHoraActual()}`;
    document.getElementById('reporte-socios').style.display = 'block';
}

// 3. Cuentas por Tipo
async function cargarCuentasPorTipo() {
    const response = await fetch(`${API_URL}/reportes/cuentas-por-tipo`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const datos = await response.json();

    datosActualesReporte = { tipo: 'cuentas', datos };

    // Gráfica de distribución
    destruirGrafica('chart-cuentas-tipo');
    crearGraficaDona('chart-cuentas-tipo',
        datos.map(c => c.tipo_cuenta),
        datos.map(c => c.cantidad),
        ['#3498db', '#27ae60', '#e67e22']
    );

    // Gráfica de saldos
    destruirGrafica('chart-cuentas-saldos');
    crearGraficaBarras('chart-cuentas-saldos',
        datos.map(c => c.tipo_cuenta),
        datos.map(c => c.saldo_total),
        'Saldo Total'
    );

    // Tabla
    const tbody = document.querySelector('#tabla-cuentas-tipo tbody');
    tbody.innerHTML = datos.map(c => `
        <tr>
            <td>${c.tipo_cuenta}</td>
            <td class="text-center">${c.cantidad}</td>
            <td class="text-right">${formatearMoneda(c.saldo_total)}</td>
            <td class="text-right">${formatearMoneda(c.saldo_promedio)}</td>
            <td class="text-right">${formatearMoneda(c.saldo_maximo)}</td>
            <td class="text-right">${formatearMoneda(c.saldo_minimo)}</td>
        </tr>
    `).join('');

    document.getElementById('fecha-reporte-cuentas').textContent = `Generado: ${obtenerFechaHoraActual()}`;
    document.getElementById('reporte-cuentas').style.display = 'block';
}

// 4. Préstamos Detallado
async function cargarPrestamosDetallado(fechaInicio, fechaFin) {
    const response = await fetch(`${API_URL}/reportes/prestamos-detallado?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const datos = await response.json();

    datosActualesReporte = { tipo: 'prestamos', datos };

    const tbody = document.querySelector('#tabla-prestamos tbody');
    tbody.innerHTML = datos.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${formatearFecha(p.fecha_solicitud)}</td>
            <td>${p.socio_nombre} ${p.socio_apellido}</td>
            <td>${p.socio_identificacion}</td>
            <td class="text-right">${formatearMoneda(p.monto)}</td>
            <td class="text-center">${p.tasa_interes}%</td>
            <td class="text-center">${p.plazo_meses} meses</td>
            <td class="text-right">${formatearMoneda(p.cuota_mensual)}</td>
            <td class="text-right">${formatearMoneda(p.saldo_pendiente)}</td>
            <td class="text-center">${p.pagos_realizados}</td>
            <td class="text-right">${formatearMoneda(p.total_pagado)}</td>
            <td class="text-center">${obtenerBadgeEstado(p.estado)}</td>
        </tr>
    `).join('');

    document.getElementById('fecha-reporte-prestamos').textContent = `Generado: ${obtenerFechaHoraActual()}`;
    document.getElementById('reporte-prestamos').style.display = 'block';
}

// 5. Préstamos en Mora
async function cargarPrestamosEnMora() {
    const response = await fetch(`${API_URL}/reportes/prestamos-mora`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const datos = await response.json();

    datosActualesReporte = { tipo: 'mora', datos };

    const tbody = document.querySelector('#tabla-mora tbody');
    tbody.innerHTML = datos.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.nombre} ${p.apellido}</td>
            <td>${p.identificacion}</td>
            <td>${p.telefono || 'N/A'}</td>
            <td class="text-right">${formatearMoneda(p.monto)}</td>
            <td class="text-right">${formatearMoneda(p.saldo_pendiente)}</td>
            <td class="text-right">${formatearMoneda(p.cuota_mensual)}</td>
            <td class="text-center">${p.pagos_realizados}</td>
            <td class="text-center">${p.cuotas_pendientes}</td>
            <td class="text-center"><span class="badge badge-danger">${p.dias_mora} días</span></td>
        </tr>
    `).join('');

    document.getElementById('fecha-reporte-mora').textContent = `Generado: ${obtenerFechaHoraActual()}`;
    document.getElementById('reporte-mora').style.display = 'block';
}

// 6. Pagos por Período
async function cargarPagosPorPeriodo(fechaInicio, fechaFin) {
    const response = await fetch(`${API_URL}/reportes/pagos-periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const datos = await response.json();

    datosActualesReporte = { tipo: 'pagos', datos };

    // Gráfica de evolución
    destruirGrafica('chart-pagos-evolucion');
    crearGraficaLinea('chart-pagos-evolucion',
        datos.map(p => p.mes),
        datos.map(p => p.total_pagado),
        'Total Pagado'
    );

    // Tabla
    const tbody = document.querySelector('#tabla-pagos-periodo tbody');
    tbody.innerHTML = datos.map(p => `
        <tr>
            <td>${p.mes}</td>
            <td class="text-center">${p.cantidad_pagos}</td>
            <td class="text-right">${formatearMoneda(p.total_pagado)}</td>
            <td class="text-right">${formatearMoneda(p.promedio_pago)}</td>
        </tr>
    `).join('');

    document.getElementById('fecha-reporte-pagos').textContent = `Generado: ${obtenerFechaHoraActual()}`;
    document.getElementById('reporte-pagos').style.display = 'block';
}

// 7. Transacciones por Tipo
async function cargarTransaccionesPorTipo(fechaInicio, fechaFin) {
    const response = await fetch(`${API_URL}/reportes/transacciones-tipo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const datos = await response.json();

    datosActualesReporte = { tipo: 'transacciones', datos };

    // Gráfica de distribución
    destruirGrafica('chart-transacciones-tipo');
    crearGraficaDona('chart-transacciones-tipo',
        datos.map(t => t.tipo),
        datos.map(t => t.cantidad),
        ['#3498db', '#e67e22', '#9b59b6']
    );

    // Gráfica de montos
    destruirGrafica('chart-transacciones-montos');
    crearGraficaBarras('chart-transacciones-montos',
        datos.map(t => t.tipo),
        datos.map(t => t.monto_total),
        'Monto Total'
    );

    document.getElementById('fecha-reporte-transacciones').textContent = `Generado: ${obtenerFechaHoraActual()}`;
    document.getElementById('reporte-transacciones').style.display = 'block';
}

// 8. Evolución de Saldos
async function cargarEvolucionSaldos(fechaInicio, fechaFin) {
    const response = await fetch(`${API_URL}/reportes/evolucion-saldos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const datos = await response.json();

    datosActualesReporte = { tipo: 'evolucion', datos };

    destruirGrafica('chart-evolucion-saldos');
    const ctx = document.getElementById('chart-evolucion-saldos').getContext('2d');
    chartInstances['chart-evolucion-saldos'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datos.map(d => d.mes),
            datasets: [
                {
                    label: 'Depósitos',
                    data: datos.map(d => d.depositos),
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Retiros',
                    data: datos.map(d => d.retiros),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    document.getElementById('fecha-reporte-evolucion').textContent = `Generado: ${obtenerFechaHoraActual()}`;
    document.getElementById('reporte-evolucion').style.display = 'block';
}

// 9. Top Socios
async function cargarTopSocios() {
    const response = await fetch(`${API_URL}/reportes/top-socios?limite=10`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const datos = await response.json();

    datosActualesReporte = { tipo: 'top-socios', datos };

    const tbody = document.querySelector('#tabla-top-socios tbody');
    tbody.innerHTML = datos.map((s, index) => `
        <tr>
            <td class="text-center"><strong>${index + 1}</strong></td>
            <td>${s.nombre} ${s.apellido}</td>
            <td>${s.identificacion}</td>
            <td>${formatearFecha(s.fecha_ingreso)}</td>
            <td class="text-center">${s.total_cuentas}</td>
            <td class="text-right"><strong>${formatearMoneda(s.saldo_total)}</strong></td>
            <td class="text-center">${s.total_prestamos}</td>
            <td class="text-right">${formatearMoneda(s.deuda_total)}</td>
        </tr>
    `).join('');

    document.getElementById('fecha-reporte-top').textContent = `Generado: ${obtenerFechaHoraActual()}`;
    document.getElementById('reporte-top-socios').style.display = 'block';
}

// 10. Crecimiento de Socios
async function cargarCrecimientoSocios() {
    await cargarAnalisisSocios(); // Reutilizar la función de análisis de socios
}

// =======================================
// FUNCIONES DE GRÁFICAS
// =======================================

function destruirGrafica(canvasId) {
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
        delete chartInstances[canvasId];
    }
}

function crearGraficaDona(canvasId, labels, data, colors) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

function crearGraficaBarras(canvasId, labels, data, label) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function crearGraficaLinea(canvasId, labels, data, label) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// =======================================
// EXPORTACIÓN A PDF
// =======================================
async function exportarPDF() {
    if (!datosActualesReporte) {
        alert('Primero genera un reporte para poder exportarlo');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tipoReporte = document.getElementById('tipo-reporte').selectedOptions[0].text;
    const fechaInicio = document.getElementById('filtro-fecha-inicio').value;
    const fechaFin = document.getElementById('filtro-fecha-fin').value;

    // Encabezado con estilo
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('COOP-SMART', 15, 15);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Sistema de Gestión Cooperativa', 15, 22);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(tipoReporte, 15, 30);
    
    // Información de fechas
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    let yPos = 42;
    doc.text(`Período: ${fechaInicio} al ${fechaFin}`, 15, yPos);
    yPos += 5;
    doc.text(`Generado: ${obtenerFechaHoraActual()}`, 15, yPos);
    yPos += 10;

    doc.setTextColor(0, 0, 0);

    // Contenido según tipo de reporte
    switch (datosActualesReporte.tipo) {
        case 'resumen':
            // KPIs principales
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(30, 64, 175);
            doc.text('Resumen General', 15, yPos);
            yPos += 8;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            
            const datos = datosActualesReporte.datos;
            
            // Tabla de KPIs
            doc.autoTable({
                startY: yPos,
                head: [['Indicador', 'Valor']],
                body: [
                    ['👥 Socios Activos', `${datos.total_socios_activos || 0} de ${datos.total_socios || 0} totales`],
                    ['💳 Cuentas Activas', datos.total_cuentas_activas || 0],
                    ['💰 Saldo Total en Cuentas', formatearMoneda(datos.saldo_total_cuentas || 0)],
                    ['💵 Préstamos Activos', datos.prestamos_activos || 0],
                    ['💰 Monto Total Prestado', formatearMoneda(datos.monto_total_prestamos || 0)],
                    ['⏳ Préstamos Pendientes', datos.prestamos_pendientes || 0],
                    ['💸 Saldo Pendiente Total', formatearMoneda(datos.saldo_pendiente_total || 0)],
                    ['💚 Total Pagos del Período', formatearMoneda(datos.total_pagos_periodo || 0)],
                    ['📊 Cantidad de Pagos', datos.cantidad_pagos_periodo || 0],
                    ['📈 Total Depósitos', formatearMoneda(datos.total_depositos || 0)],
                    ['📉 Total Retiros', formatearMoneda(datos.total_retiros || 0)]
                ],
                headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 10 },
                bodyStyles: { fontSize: 9 },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { left: 15, right: 15 }
            });
            break;

        case 'socios':
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(30, 64, 175);
            doc.text('Socios por Estado', 15, yPos);
            yPos += 8;
            
            doc.autoTable({
                startY: yPos,
                head: [['Estado', 'Cantidad']],
                body: datosActualesReporte.sociosPorEstado.map(s => [s.estado, s.cantidad]),
                headStyles: { fillColor: [30, 64, 175], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { left: 15, right: 15 }
            });
            
            yPos = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Crecimiento de Socios', 15, yPos);
            yPos += 8;
            
            doc.autoTable({
                startY: yPos,
                head: [['Mes', 'Nuevos Socios']],
                body: datosActualesReporte.crecimiento.map(c => [c.mes, c.nuevos_socios]),
                headStyles: { fillColor: [30, 64, 175], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { left: 15, right: 15 }
            });
            break;

        case 'cuentas':
            doc.autoTable({
                startY: yPos,
                head: [['Tipo de Cuenta', 'Cantidad', 'Saldo Total', 'Saldo Promedio', 'Saldo Máximo', 'Saldo Mínimo']],
                body: datosActualesReporte.datos.map(c => [
                    c.tipo_cuenta,
                    c.cantidad,
                    formatearMoneda(c.saldo_total),
                    formatearMoneda(c.saldo_promedio),
                    formatearMoneda(c.saldo_maximo),
                    formatearMoneda(c.saldo_minimo)
                ]),
                headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 9 },
                bodyStyles: { fontSize: 8 },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { left: 15, right: 15 }
            });
            break;

        case 'prestamos':
            doc.autoTable({
                startY: yPos,
                head: [['ID', 'Socio', 'Monto', 'Tasa%', 'Plazo', 'Cuota', 'Saldo Pend.', 'Estado']],
                body: datosActualesReporte.datos.map(p => [
                    p.id,
                    `${p.socio_nombre} ${p.socio_apellido}`,
                    formatearMoneda(p.monto),
                    `${p.tasa_interes}%`,
                    `${p.plazo_meses}m`,
                    formatearMoneda(p.cuota_mensual),
                    formatearMoneda(p.saldo_pendiente),
                    p.estado
                ]),
                headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 8 },
                bodyStyles: { fontSize: 7 },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { left: 15, right: 15 }
            });
            break;

        case 'mora':
            doc.autoTable({
                startY: yPos,
                head: [['ID', 'Socio', 'Teléfono', 'Monto', 'Saldo Pend.', 'Cuota', 'Días Mora']],
                body: datosActualesReporte.datos.map(p => [
                    p.id,
                    `${p.nombre} ${p.apellido}`,
                    p.telefono,
                    formatearMoneda(p.monto),
                    formatearMoneda(p.saldo_pendiente),
                    formatearMoneda(p.cuota_mensual),
                    `${p.dias_mora} días`
                ]),
                headStyles: { fillColor: [239, 68, 68], textColor: 255, fontSize: 8 },
                bodyStyles: { fontSize: 7 },
                alternateRowStyles: { fillColor: [254, 242, 242] },
                margin: { left: 15, right: 15 }
            });
            break;

        case 'top-socios':
            doc.autoTable({
                startY: yPos,
                head: [['#', 'Nombre', 'Identificación', 'Saldo Total', 'Deuda Total']],
                body: datosActualesReporte.datos.map((s, i) => [
                    i + 1,
                    `${s.nombre} ${s.apellido}`,
                    s.identificacion,
                    formatearMoneda(s.saldo_total),
                    formatearMoneda(s.deuda_total)
                ]),
                headStyles: { fillColor: [30, 64, 175], textColor: 255 },
                bodyStyles: { fontSize: 8 },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { left: 15, right: 15 }
            });
            break;

        default:
            doc.setFontSize(10);
            doc.text('Reporte generado exitosamente', 15, yPos);
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text('COOP-SMART - Sistema de Gestión Cooperativa', 15, doc.internal.pageSize.height - 10);
    }

    // Guardar PDF
    const nombreArchivo = `${tipoReporte.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
}

// =======================================
// EXPORTACIÓN A EXCEL
// =======================================
function exportarExcel() {
    if (!datosActualesReporte) {
        alert('Primero genera un reporte para poder exportarlo');
        return;
    }

    let datos = [];
    let nombreHoja = 'Reporte';

    // Preparar datos según tipo
    switch (datosActualesReporte.tipo) {
        case 'cuentas':
            nombreHoja = 'Cuentas por Tipo';
            datos = datosActualesReporte.datos.map(c => ({
                'Tipo de Cuenta': c.tipo_cuenta,
                'Cantidad': c.cantidad,
                'Saldo Total': c.saldo_total,
                'Saldo Promedio': c.saldo_promedio,
                'Saldo Máximo': c.saldo_maximo,
                'Saldo Mínimo': c.saldo_minimo
            }));
            break;

        case 'prestamos':
            nombreHoja = 'Préstamos';
            datos = datosActualesReporte.datos.map(p => ({
                'ID': p.id,
                'Fecha': p.fecha_solicitud,
                'Socio': `${p.socio_nombre} ${p.socio_apellido}`,
                'Identificación': p.socio_identificacion,
                'Monto': p.monto,
                'Tasa %': p.tasa_interes,
                'Plazo (meses)': p.plazo_meses,
                'Cuota': p.cuota_mensual,
                'Saldo Pendiente': p.saldo_pendiente,
                'Estado': p.estado
            }));
            break;

        case 'mora':
            nombreHoja = 'Préstamos en Mora';
            datos = datosActualesReporte.datos.map(p => ({
                'ID': p.id,
                'Socio': `${p.nombre} ${p.apellido}`,
                'Identificación': p.identificacion,
                'Teléfono': p.telefono,
                'Monto': p.monto,
                'Saldo Pendiente': p.saldo_pendiente,
                'Cuota Mensual': p.cuota_mensual,
                'Días en Mora': p.dias_mora
            }));
            break;

        case 'top-socios':
            nombreHoja = 'Top Socios';
            datos = datosActualesReporte.datos.map((s, i) => ({
                'Posición': i + 1,
                'Nombre': `${s.nombre} ${s.apellido}`,
                'Identificación': s.identificacion,
                'Fecha Ingreso': s.fecha_ingreso,
                'Total Cuentas': s.total_cuentas,
                'Saldo Total': s.saldo_total,
                'Total Préstamos': s.total_prestamos,
                'Deuda Total': s.deuda_total
            }));
            break;

        case 'pagos':
            nombreHoja = 'Pagos por Período';
            datos = datosActualesReporte.datos.map(p => ({
                'Mes': p.mes,
                'Cantidad de Pagos': p.cantidad_pagos,
                'Total Pagado': p.total_pagado,
                'Promedio': p.promedio_pago
            }));
            break;

        default:
            alert('Este tipo de reporte no soporta exportación a Excel');
            return;
    }

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

    // Guardar archivo
    const nombreArchivo = `reporte-${datosActualesReporte.tipo}-${Date.now()}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
}

// =======================================
// FUNCIONES AUXILIARES
// =======================================

function ocultarTodosLosReportes() {
    document.getElementById('mensaje-inicial').style.display = 'none';
    document.getElementById('reporte-resumen').style.display = 'none';
    document.getElementById('reporte-socios').style.display = 'none';
    document.getElementById('reporte-cuentas').style.display = 'none';
    document.getElementById('reporte-prestamos').style.display = 'none';
    document.getElementById('reporte-mora').style.display = 'none';
    document.getElementById('reporte-pagos').style.display = 'none';
    document.getElementById('reporte-transacciones').style.display = 'none';
    document.getElementById('reporte-evolucion').style.display = 'none';
    document.getElementById('reporte-top-socios').style.display = 'none';
}

function mostrarCargando() {
    // Crear overlay de carga si no existe
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                <h3 style="margin: 0 0 0.5rem 0; color: #2c3e50;">Generando reporte...</h3>
                <p style="margin: 0; color: #7f8c8d;">Por favor espera un momento</p>
            </div>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

function ocultarCargando() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL',
        minimumFractionDigits: 2
    }).format(valor || 0);
}

function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function obtenerFechaHoraActual() {
    return new Date().toLocaleString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function obtenerBadgeEstado(estado) {
    const badges = {
        'Aprobado': '<span class="badge badge-success">Aprobado</span>',
        'Pendiente': '<span class="badge badge-warning">Pendiente</span>',
        'Rechazado': '<span class="badge badge-danger">Rechazado</span>',
        'Completado': '<span class="badge badge-info">Completado</span>'
    };
    return badges[estado] || `<span class="badge">${estado}</span>`;
}

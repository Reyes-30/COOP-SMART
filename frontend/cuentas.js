// ============================================
// CUENTAS - FUNCIONALIDAD COMPLETA
// ============================================

// Configuración de API
const API_URL = (window.location.hostname === 'localhost' || window.location.protocol === 'file:')
    ? 'http://localhost:3000' 
    : 'https://coop-smart.vercel.app';

// Estado de la aplicación
let cuentas = [];
let socios = [];
let filtroActual = 'todas';
let estadoActual = 'todas';

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarUsuario();
    initEventListeners();
    cargarSocios();
    cargarCuentas();
    
    // Auto-refresh cada 30 segundos
    setInterval(() => {
        cargarCuentas();
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
    const nombre = localStorage.getItem('nombre') || 'Admin';
    const rol = localStorage.getItem('rol') || 'Administrador';
    
    const userNameElements = document.querySelectorAll('#userName');
    const userRoleElements = document.querySelectorAll('#userRole');
    
    userNameElements.forEach(el => el.textContent = nombre);
    userRoleElements.forEach(el => el.textContent = rol);
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
    
    document.getElementById('estadoFilter').addEventListener('change', handleEstadoFilter);
    
    // Botones principales
    document.getElementById('btnNuevaCuenta').addEventListener('click', abrirModalNuevaCuenta);
    document.getElementById('btnExportar').addEventListener('click', exportarCuentas);
    
    // Modal Nueva Cuenta
    document.getElementById('btnCloseNueva').addEventListener('click', cerrarModalNuevaCuenta);
    document.getElementById('btnCancelarNueva').addEventListener('click', cerrarModalNuevaCuenta);
    document.getElementById('formNuevaCuenta').addEventListener('submit', handleCrearCuenta);
    
    // Cambio de tipo de cuenta
    document.querySelectorAll('input[name="tipo_cuenta"]').forEach(radio => {
        radio.addEventListener('change', handleTipoCuentaChange);
    });
    
    // Cambio de plazo para fecha de vencimiento
    document.getElementById('plazo_meses').addEventListener('change', calcularFechaVencimiento);
    
    // Modal Transacción
    document.getElementById('btnCloseTransaccion').addEventListener('click', cerrarModalTransaccion);
    document.getElementById('btnCancelarTransaccion').addEventListener('click', cerrarModalTransaccion);
    document.getElementById('formTransaccion').addEventListener('submit', handleTransaccion);
    document.getElementById('monto').addEventListener('input', actualizarPreviewSaldo);
    
    // Modal Detalles
    document.getElementById('btnCloseDetalles').addEventListener('click', cerrarModalDetalles);
    document.getElementById('btnCerrarDetalles').addEventListener('click', cerrarModalDetalles);
    document.getElementById('btnImprimirEstado').addEventListener('click', imprimirEstado);
    
    // Tabs en modal detalles
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleTabClick(e.target));
    });
    
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

async function cargarCuentas() {
    try {
        showLoading(true);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/cuentas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar cuentas');
        
        cuentas = await response.json();
        actualizarEstadisticas();
        renderizarCuentas();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar las cuentas');
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
        mostrarError('Error al cargar socios/clientes');
    }
}

// ============================================
// ESTADÍSTICAS
// ============================================

function actualizarEstadisticas() {
    // Total en cuentas
    const totalSaldo = cuentas.reduce((sum, c) => sum + parseFloat(c.saldo || 0), 0);
    document.getElementById('totalSaldo').textContent = formatearMoneda(totalSaldo);
    
    // Total cuentas
    document.getElementById('totalCuentas').textContent = cuentas.length;
    
    // Cuentas activas
    const activas = cuentas.filter(c => c.estado === 'activa').length;
    document.getElementById('cuentasActivas').textContent = activas;
    
    // Nuevas este mes
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const nuevas = cuentas.filter(c => new Date(c.fecha_apertura) >= inicioMes).length;
    document.getElementById('nuevasMes').textContent = nuevas;
    
    // Actualizar contadores de filtros
    document.getElementById('countTodas').textContent = cuentas.length;
    document.getElementById('countAhorro').textContent = 
        cuentas.filter(c => c.tipo_cuenta === 'ahorro').length;
    document.getElementById('countCorriente').textContent = 
        cuentas.filter(c => c.tipo_cuenta === 'corriente').length;
    document.getElementById('countPlazo').textContent = 
        cuentas.filter(c => c.tipo_cuenta === 'plazo_fijo').length;
}

// ============================================
// RENDERIZAR TABLA
// ============================================

function renderizarCuentas() {
    const tbody = document.getElementById('cuentasTableBody');
    
    // Filtrar cuentas
    let cuentasFiltradas = cuentas.filter(cuenta => {
        // Filtro por tipo
        if (filtroActual !== 'todas' && cuenta.tipo_cuenta !== filtroActual) {
            return false;
        }
        
        // Filtro por estado
        if (estadoActual !== 'todas' && cuenta.estado !== estadoActual) {
            return false;
        }
        
        return true;
    });
    
    if (cuentasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <p style="color: #6B7280; font-size: 1rem;">No se encontraron cuentas</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = cuentasFiltradas.map(cuenta => `
        <tr>
            <td><strong>${cuenta.numero_cuenta}</strong></td>
            <td>${obtenerNombreTitular(cuenta.id_socio)}</td>
            <td><span class="badge badge-${cuenta.tipo_cuenta.replace('_', '')}">${formatearTipoCuenta(cuenta.tipo_cuenta)}</span></td>
            <td><strong>${formatearMoneda(cuenta.saldo)}</strong></td>
            <td>${cuenta.tasa_interes}%</td>
            <td>${formatearFecha(cuenta.fecha_apertura)}</td>
            <td><span class="badge badge-${cuenta.estado}">${capitalizar(cuenta.estado)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-view" onclick="verDetalles(${cuenta.id})" title="Ver detalles">
                        👁️
                    </button>
                    <button class="action-btn btn-deposit" onclick="abrirModalDeposito(${cuenta.id})" title="Depositar">
                        ⬇️
                    </button>
                    <button class="action-btn btn-withdraw" onclick="abrirModalRetiro(${cuenta.id})" title="Retirar">
                        ⬆️
                    </button>
                    <button class="action-btn btn-edit" onclick="editarCuenta(${cuenta.id})" title="Editar">
                        ✏️
                    </button>
                    <button class="action-btn btn-block" onclick="toggleEstadoCuenta(${cuenta.id})" title="Bloquear/Activar">
                        ${cuenta.estado === 'bloqueada' ? '🔓' : '🔒'}
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================

function handleFilterClick(btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    filtroActual = btn.dataset.filter;
    renderizarCuentas();
}

function handleEstadoFilter(e) {
    estadoActual = e.target.value;
    renderizarCuentas();
}

function handleGlobalSearch(e) {
    const busqueda = e.target.value.toLowerCase().trim();
    
    if (!busqueda) {
        renderizarCuentas();
        return;
    }
    
    const tbody = document.getElementById('cuentasTableBody');
    const cuentasFiltradas = cuentas.filter(cuenta => {
        const titular = obtenerNombreTitular(cuenta.id_socio).toLowerCase();
        const numero = cuenta.numero_cuenta.toLowerCase();
        
        return numero.includes(busqueda) || titular.includes(busqueda);
    });
    
    if (cuentasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <p style="color: #6B7280; font-size: 1rem;">No se encontraron resultados para "${e.target.value}"</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = cuentasFiltradas.map(cuenta => `
        <tr>
            <td><strong>${cuenta.numero_cuenta}</strong></td>
            <td>${obtenerNombreTitular(cuenta.id_socio)}</td>
            <td><span class="badge badge-${cuenta.tipo_cuenta.replace('_', '')}">${formatearTipoCuenta(cuenta.tipo_cuenta)}</span></td>
            <td><strong>${formatearMoneda(cuenta.saldo)}</strong></td>
            <td>${cuenta.tasa_interes}%</td>
            <td>${formatearFecha(cuenta.fecha_apertura)}</td>
            <td><span class="badge badge-${cuenta.estado}">${capitalizar(cuenta.estado)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-view" onclick="verDetalles(${cuenta.id})" title="Ver detalles">👁️</button>
                    <button class="action-btn btn-deposit" onclick="abrirModalDeposito(${cuenta.id})" title="Depositar">⬇️</button>
                    <button class="action-btn btn-withdraw" onclick="abrirModalRetiro(${cuenta.id})" title="Retirar">⬆️</button>
                    <button class="action-btn btn-edit" onclick="editarCuenta(${cuenta.id})" title="Editar">✏️</button>
                    <button class="action-btn btn-block" onclick="toggleEstadoCuenta(${cuenta.id})" title="Bloquear/Activar">
                        ${cuenta.estado === 'bloqueada' ? '🔓' : '🔒'}
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================
// MODAL NUEVA CUENTA
// ============================================

function abrirModalNuevaCuenta() {
    document.getElementById('formNuevaCuenta').reset();
    document.getElementById('tasa_interes').value = '5.00';
    document.getElementById('seccionPlazoFijo').style.display = 'none';
    document.getElementById('modalNuevaCuenta').classList.add('show');
}

function cerrarModalNuevaCuenta() {
    document.getElementById('modalNuevaCuenta').classList.remove('show');
}

function llenarSelectSocios() {
    const select = document.getElementById('id_socio');
    select.innerHTML = '<option value="">Seleccionar...</option>';
    
    socios
        .filter(s => s.estado === 'activo')
        .forEach(socio => {
            const option = document.createElement('option');
            option.value = socio.id;
            option.textContent = `${socio.nombre} ${socio.apellido} - ${socio.identidad} (${capitalizar(socio.tipo)})`;
            select.appendChild(option);
        });
}

function handleTipoCuentaChange(e) {
    const tipo = e.target.value;
    const tasaInput = document.getElementById('tasa_interes');
    const seccionPlazoFijo = document.getElementById('seccionPlazoFijo');
    
    if (tipo === 'ahorro') {
        tasaInput.value = '5.00';
        seccionPlazoFijo.style.display = 'none';
    } else if (tipo === 'corriente') {
        tasaInput.value = '0.00';
        seccionPlazoFijo.style.display = 'none';
    } else if (tipo === 'plazo_fijo') {
        tasaInput.value = '8.00';
        seccionPlazoFijo.style.display = 'block';
        calcularFechaVencimiento();
    }
}

function calcularFechaVencimiento() {
    const plazoMeses = parseInt(document.getElementById('plazo_meses').value);
    const hoy = new Date();
    const fechaVencimiento = new Date(hoy.setMonth(hoy.getMonth() + plazoMeses));
    
    document.getElementById('fecha_vencimiento').value = 
        fechaVencimiento.toISOString().split('T')[0];
}

async function handleCrearCuenta(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        id_socio: parseInt(formData.get('id_socio')),
        tipo_cuenta: formData.get('tipo_cuenta'),
        saldo: parseFloat(formData.get('saldo_inicial')) || 0,
        tasa_interes: parseFloat(formData.get('tasa_interes')) || 0,
        estado: 'activa'
    };
    
    // Validaciones
    if (!data.id_socio) {
        mostrarError('Debe seleccionar un titular');
        return;
    }
    
    if (data.saldo < 100) {
        mostrarError('El saldo inicial mínimo es L. 100.00');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/cuentas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear cuenta');
        }
        
        const nuevaCuenta = await response.json();
        
        mostrarExito('Cuenta creada exitosamente');
        cerrarModalNuevaCuenta();
        cargarCuentas();
        
        // Si hubo saldo inicial, crear transacción de depósito
        if (data.saldo > 0) {
            await crearTransaccion(nuevaCuenta.id, 'deposito', data.saldo, 'Depósito inicial');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message || 'Error al crear la cuenta');
    }
}

// ============================================
// MODAL TRANSACCIÓN
// ============================================

function abrirModalDeposito(idCuenta) {
    const cuenta = cuentas.find(c => c.id === idCuenta);
    if (!cuenta) return;
    
    document.getElementById('tituloTransaccion').textContent = 'Realizar Depósito';
    document.getElementById('transaccion_id_cuenta').value = cuenta.id;
    document.getElementById('transaccion_tipo').value = 'deposito';
    
    document.getElementById('cuentaNumeroTransaccion').textContent = cuenta.numero_cuenta;
    document.getElementById('cuentaTitularTransaccion').textContent = obtenerNombreTitular(cuenta.id_socio);
    document.getElementById('saldoActualTransaccion').textContent = formatearMoneda(cuenta.saldo);
    
    document.getElementById('formTransaccion').reset();
    document.getElementById('transaccion_id_cuenta').value = cuenta.id;
    document.getElementById('transaccion_tipo').value = 'deposito';
    
    document.getElementById('nuevoSaldo').textContent = formatearMoneda(cuenta.saldo);
    document.getElementById('btnConfirmarTransaccion').innerHTML = '<span class="btn-icon">⬇️</span> Depositar';
    
    document.getElementById('modalTransaccion').classList.add('show');
}

function abrirModalRetiro(idCuenta) {
    const cuenta = cuentas.find(c => c.id === idCuenta);
    if (!cuenta) return;
    
    if (cuenta.estado === 'bloqueada') {
        mostrarError('No se pueden hacer retiros de una cuenta bloqueada');
        return;
    }
    
    document.getElementById('tituloTransaccion').textContent = 'Realizar Retiro';
    document.getElementById('transaccion_id_cuenta').value = cuenta.id;
    document.getElementById('transaccion_tipo').value = 'retiro';
    
    document.getElementById('cuentaNumeroTransaccion').textContent = cuenta.numero_cuenta;
    document.getElementById('cuentaTitularTransaccion').textContent = obtenerNombreTitular(cuenta.id_socio);
    document.getElementById('saldoActualTransaccion').textContent = formatearMoneda(cuenta.saldo);
    
    document.getElementById('formTransaccion').reset();
    document.getElementById('transaccion_id_cuenta').value = cuenta.id;
    document.getElementById('transaccion_tipo').value = 'retiro';
    
    document.getElementById('nuevoSaldo').textContent = formatearMoneda(cuenta.saldo);
    document.getElementById('btnConfirmarTransaccion').innerHTML = '<span class="btn-icon">⬆️</span> Retirar';
    
    document.getElementById('modalTransaccion').classList.add('show');
}

function cerrarModalTransaccion() {
    document.getElementById('modalTransaccion').classList.remove('show');
}

function actualizarPreviewSaldo() {
    const idCuenta = parseInt(document.getElementById('transaccion_id_cuenta').value);
    const tipo = document.getElementById('transaccion_tipo').value;
    const monto = parseFloat(document.getElementById('monto').value) || 0;
    
    const cuenta = cuentas.find(c => c.id === idCuenta);
    if (!cuenta) return;
    
    const saldoActual = parseFloat(cuenta.saldo);
    let nuevoSaldo = saldoActual;
    
    if (tipo === 'deposito') {
        nuevoSaldo = saldoActual + monto;
    } else if (tipo === 'retiro') {
        nuevoSaldo = saldoActual - monto;
    }
    
    document.getElementById('nuevoSaldo').textContent = formatearMoneda(nuevoSaldo);
    
    // Cambiar color si el saldo quedaría negativo
    const previewValue = document.getElementById('nuevoSaldo');
    if (nuevoSaldo < 0) {
        previewValue.style.color = '#EF4444';
    } else {
        previewValue.style.color = '#166534';
    }
}

async function handleTransaccion(e) {
    e.preventDefault();
    
    const idCuenta = parseInt(document.getElementById('transaccion_id_cuenta').value);
    const tipo = document.getElementById('transaccion_tipo').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const descripcion = document.getElementById('descripcion').value || 
        (tipo === 'deposito' ? 'Depósito en cuenta' : 'Retiro en cuenta');
    
    const cuenta = cuentas.find(c => c.id === idCuenta);
    if (!cuenta) return;
    
    // Validaciones
    if (monto <= 0) {
        mostrarError('El monto debe ser mayor a 0');
        return;
    }
    
    if (tipo === 'retiro' && monto > parseFloat(cuenta.saldo)) {
        mostrarError('Fondos insuficientes');
        return;
    }
    
    try {
        // 1. Crear la transacción
        await crearTransaccion(idCuenta, tipo, monto, descripcion);
        
        // 2. Actualizar saldo de la cuenta
        const nuevoSaldo = tipo === 'deposito' 
            ? parseFloat(cuenta.saldo) + monto 
            : parseFloat(cuenta.saldo) - monto;
        
        await actualizarSaldoCuenta(idCuenta, nuevoSaldo);
        
        mostrarExito(`${capitalizar(tipo)} realizado exitosamente`);
        cerrarModalTransaccion();
        cargarCuentas();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message || 'Error al procesar la transacción');
    }
}

async function crearTransaccion(idCuenta, tipo, monto, descripcion) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/transacciones`, {
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
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear transacción');
    }
    
    return await response.json();
}

async function actualizarSaldoCuenta(idCuenta, nuevoSaldo) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/cuentas/${idCuenta}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ saldo: nuevoSaldo })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar saldo');
    }
    
    return await response.json();
}

// ============================================
// MODAL DETALLES
// ============================================

async function verDetalles(idCuenta) {
    const cuenta = cuentas.find(c => c.id === idCuenta);
    if (!cuenta) return;
    
    // Llenar información básica
    document.getElementById('detallesNumero').textContent = cuenta.numero_cuenta;
    document.getElementById('detallesTitular').textContent = obtenerNombreTitular(cuenta.id_socio);
    document.getElementById('detallesSaldo').textContent = formatearMoneda(cuenta.saldo);
    
    document.getElementById('detallesTipo').textContent = formatearTipoCuenta(cuenta.tipo_cuenta);
    document.getElementById('detallesTipo').className = `badge badge-${cuenta.tipo_cuenta.replace('_', '')}`;
    
    document.getElementById('detallesEstado').textContent = capitalizar(cuenta.estado);
    document.getElementById('detallesEstado').className = `badge badge-${cuenta.estado}`;
    
    // Tab Información
    const infoHTML = `
        <div class="detail-item">
            <div class="detail-label">Número de Cuenta</div>
            <div class="detail-value">${cuenta.numero_cuenta}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Titular</div>
            <div class="detail-value">${obtenerNombreTitular(cuenta.id_socio)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Tipo de Cuenta</div>
            <div class="detail-value">${formatearTipoCuenta(cuenta.tipo_cuenta)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Saldo Actual</div>
            <div class="detail-value">${formatearMoneda(cuenta.saldo)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Tasa de Interés</div>
            <div class="detail-value">${cuenta.tasa_interes}% anual</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Fecha de Apertura</div>
            <div class="detail-value">${formatearFecha(cuenta.fecha_apertura)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Estado</div>
            <div class="detail-value">${capitalizar(cuenta.estado)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Última Actualización</div>
            <div class="detail-value">${formatearFechaHora(cuenta.updatedAt)}</div>
        </div>
    `;
    
    document.getElementById('detallesInformacion').innerHTML = infoHTML;
    
    // Cargar movimientos
    await cargarMovimientos(idCuenta);
    
    // Mostrar modal
    document.getElementById('modalDetalles').classList.add('show');
    
    // Activar primer tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="informacion"]').classList.add('active');
    document.getElementById('tabInformacion').classList.add('active');
}

async function cargarMovimientos(idCuenta) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/transacciones?id_cuenta=${idCuenta}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar movimientos');
        
        const movimientos = await response.json();
        const tbody = document.getElementById('movimientosBody');
        
        if (movimientos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #6B7280;">
                        No hay movimientos registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = movimientos.map(mov => `
            <tr>
                <td>${formatearFechaHora(mov.fecha)}</td>
                <td><span class="tipo-${mov.tipo}">${capitalizar(mov.tipo)}</span></td>
                <td>${mov.descripcion || '-'}</td>
                <td class="${mov.tipo === 'deposito' ? 'monto-positivo' : 'monto-negativo'}">
                    ${mov.tipo === 'deposito' ? '+' : '-'} ${formatearMoneda(mov.monto)}
                </td>
                <td><strong>${formatearMoneda(mov.saldo_despues || 0)}</strong></td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('movimientosBody').innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #EF4444;">
                    Error al cargar movimientos
                </td>
            </tr>
        `;
    }
}

function cerrarModalDetalles() {
    document.getElementById('modalDetalles').classList.remove('show');
}

function handleTabClick(btn) {
    const tabName = btn.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`tab${capitalizar(tabName)}`).classList.add('active');
}

function imprimirEstado() {
    window.print();
}

// ============================================
// EDITAR / TOGGLE ESTADO
// ============================================

async function editarCuenta(idCuenta) {
    const cuenta = cuentas.find(c => c.id === idCuenta);
    if (!cuenta) return;
    
    // Por ahora solo mostrar alerta
    mostrarExito('Función de edición en desarrollo');
}

async function toggleEstadoCuenta(idCuenta) {
    const cuenta = cuentas.find(c => c.id === idCuenta);
    if (!cuenta) return;
    
    const nuevoEstado = cuenta.estado === 'bloqueada' ? 'activa' : 'bloqueada';
    const accion = nuevoEstado === 'bloqueada' ? 'bloquear' : 'desbloquear';
    
    if (!confirm(`¿Está seguro que desea ${accion} esta cuenta?`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/cuentas/${idCuenta}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        if (!response.ok) throw new Error('Error al actualizar estado');
        
        mostrarExito(`Cuenta ${accion === 'bloquear' ? 'bloqueada' : 'desbloqueada'} exitosamente`);
        cargarCuentas();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar el estado de la cuenta');
    }
}

// ============================================
// EXPORTAR
// ============================================

function exportarCuentas() {
    const csv = generarCSV();
    descargarCSV(csv, 'cuentas.csv');
    mostrarExito('Cuentas exportadas exitosamente');
}

function generarCSV() {
    const headers = ['Número Cuenta', 'Titular', 'Tipo', 'Saldo', 'Tasa Interés', 'Fecha Apertura', 'Estado'];
    const rows = cuentas.map(c => [
        c.numero_cuenta,
        obtenerNombreTitular(c.id_socio),
        formatearTipoCuenta(c.tipo_cuenta),
        c.saldo,
        c.tasa_interes,
        formatearFecha(c.fecha_apertura),
        capitalizar(c.estado)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function descargarCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// UTILIDADES
// ============================================

function obtenerNombreTitular(idSocio) {
    const socio = socios.find(s => s.id === idSocio);
    return socio ? `${socio.nombre} ${socio.apellido}` : 'Desconocido';
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
    const tbody = document.getElementById('cuentasTableBody');
    if (show) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="8">
                    <div class="loading-spinner"></div>
                    <p>Cargando cuentas...</p>
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

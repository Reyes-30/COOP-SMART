/**
 * COOP-SMART - Módulo de Socios/Clientes
 * Funcionalidad completa para gestión de socios y clientes
 */

// ===================================
// Configuración API
// ===================================
const API_URL = (window.location.hostname === 'localhost' || window.location.protocol === 'file:')
    ? 'http://localhost:3000' 
    : 'https://coop-smart.vercel.app';
let currentFilter = 'todos';
let currentEstadoFilter = 'todos';
let sociosData = [];
let currentEditId = null;
let currentPage = 1;
let totalPages = 1;
const PAGE_SIZE = 15;
let currentSearch = '';

// ===================================
// Autenticación
// ===================================
function checkAuth() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    } catch (e) {
        console.error('Error verificando autenticación:', e);
        return false;
    }
}

// ===================================
// Inicialización
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    checkAuth();
    
    // Eventos de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
            }
        });
    }
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        });
    }
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const target = e.currentTarget; // asegurar el botón, no el span interno
            target.classList.add('active');
            currentFilter = target.dataset.filter;
            currentPage = 1; // reiniciar a la primera página
            loadSociosData(); // solicitar al backend con filtros
        });
    });
    
    const estadoFilter = document.getElementById('estadoFilter');
    if (estadoFilter) {
        estadoFilter.addEventListener('change', (e) => {
            currentEstadoFilter = e.target.value;
            currentPage = 1; // reiniciar a la primera página
            loadSociosData(); // solicitar al backend con filtros
        });
    }
    
    // Búsqueda en panel de filtros (server-side)
    const busquedaInput = document.getElementById('busquedaInput');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimpiarBusqueda = document.getElementById('btnLimpiarBusqueda');
    if (busquedaInput && btnBuscar && btnLimpiarBusqueda) {
        btnBuscar.addEventListener('click', () => {
            currentSearch = busquedaInput.value.trim();
            currentPage = 1;
            loadSociosData();
        });
        busquedaInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                currentSearch = busquedaInput.value.trim();
                currentPage = 1;
                loadSociosData();
            }
        });
        btnLimpiarBusqueda.addEventListener('click', () => {
            busquedaInput.value = '';
            currentSearch = '';
            currentPage = 1;
            loadSociosData();
        });
    }
    
    // Botones
    const btnNuevo = document.getElementById('btnNuevoSocio');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', openNewModal);
    }
    
    const btnCSV = document.getElementById('btnExportarCSV');
    const btnExcel = document.getElementById('btnExportarExcel');
    const btnPDF = document.getElementById('btnExportarPDF');
    if (btnCSV) btnCSV.addEventListener('click', exportarCSV);
    if (btnExcel) btnExcel.addEventListener('click', exportarExcel);
    if (btnPDF) btnPDF.addEventListener('click', exportarPDF);
    
    // Modal
    const btnCloseModal = document.getElementById('btnCloseModal');
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeModal);
    }
    
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', closeModal);
    }
    
    const formSocio = document.getElementById('formSocio');
    if (formSocio) {
        formSocio.addEventListener('submit', handleSubmit);
    }

    // Validaciones y máscaras de entrada
    setupInputValidations();

    // Paginación
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadSociosData();
            }
        });
    }
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadSociosData();
            }
        });
    }
    
    // Modal Detalles
    const btnCloseDetalles = document.getElementById('btnCloseDetalles');
    if (btnCloseDetalles) {
        btnCloseDetalles.addEventListener('click', closeDetallesModal);
    }
    
    // Tipo de registro (mostrar/ocultar sección de socio)
    document.querySelectorAll('input[name="tipo"]').forEach(radio => {
        radio.addEventListener('change', toggleSocioSection);
    });
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Fecha de ingreso por defecto
    document.getElementById('fecha_ingreso').valueAsDate = new Date();
    // Cargar listado inicial
    loadSociosData();
});

function handleLogout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// ===================================
// Cargar Datos
// ===================================
async function loadSociosData() {
    const token = localStorage.getItem('token');
    
    try {
        const baseUrl = API_URL.replace('localhost','127.0.0.1');
        const params = new URLSearchParams({
            pagina: String(currentPage),
            limite: String(PAGE_SIZE),
            tipo: currentFilter === 'todos' ? '' : currentFilter,
            estado: currentEstadoFilter === 'todos' ? '' : currentEstadoFilter,
            busqueda: currentSearch
        });
        const response = await fetch(`${baseUrl}/api/socios?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            // Manejar respuesta paginada o array directo
            sociosData = Array.isArray(data) ? data : (data.socios || []);
            const pag = data.paginacion;
            if (pag) {
                currentPage = pag.pagina;
                totalPages = pag.total_paginas;
                updatePagination();
            } else {
                totalPages = 1;
                updatePagination();
            }
            updateStats();
            displaySocios(sociosData);
        } else {
            throw new Error('Error al cargar datos');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar los datos', 'error');
        document.getElementById('sociosTableBody').innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem;">
                    <p style="color: var(--error);">Error al cargar los datos</p>
                    <button onclick="loadSociosData()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-blue); color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

function updatePagination() {
    const info = document.getElementById('pageInfo');
    const prev = document.getElementById('btnPrevPage');
    const next = document.getElementById('btnNextPage');
    if (info) info.textContent = `Página ${currentPage} de ${totalPages}`;
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= totalPages;
}

// ===================================
// Actualizar Estadísticas
// ===================================
async function updateStats() {
    // Totales globales deben ser sobre todos los registros, no solo la página actual
    try {
        const token = localStorage.getItem('token');
        const baseUrl = API_URL.replace('localhost','127.0.0.1');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Obtener total general
        const resTodos = await fetch(`${baseUrl}/api/socios?pagina=1&limite=1`, { headers });
        // Total por tipo socio
        const resSocios = await fetch(`${baseUrl}/api/socios?pagina=1&limite=1&tipo=socio`, { headers });
        // Total por tipo cliente
        const resClientes = await fetch(`${baseUrl}/api/socios?pagina=1&limite=1&tipo=cliente`, { headers });
        // Total activos
        const resActivos = await fetch(`${baseUrl}/api/socios?pagina=1&limite=1&estado=activo`, { headers });

        const getTotal = async (res) => {
            if (!res.ok) return null;
            const data = await res.json();
            return data?.paginacion?.total ?? (Array.isArray(data) ? data.length : null);
        };

        const totalTodos = await getTotal(resTodos);
        const totalSocios = await getTotal(resSocios);
        const totalClientes = await getTotal(resClientes);
        const totalActivos = await getTotal(resActivos);

        if (totalSocios != null) document.getElementById('totalSocios').textContent = totalSocios;
        if (totalClientes != null) document.getElementById('totalClientes').textContent = totalClientes;
        if (totalActivos != null) document.getElementById('totalActivos').textContent = totalActivos;

        // Nuevos este mes (global): traer una muestra amplia y contar
        const hoy = new Date();
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        let nuevosMesCount = 0;
        try {
            const resMes = await fetch(`${baseUrl}/api/socios?pagina=1&limite=1000`, { headers });
            if (resMes.ok) {
                const dataMes = await resMes.json();
                const listaMes = Array.isArray(dataMes) ? dataMes : (dataMes.socios || []);
                nuevosMesCount = listaMes.filter(s => s.fecha_ingreso && new Date(s.fecha_ingreso) >= primerDiaMes).length;
            } else {
                // respaldo: usar página actual
                nuevosMesCount = sociosData.filter(s => new Date(s.fecha_ingreso) >= primerDiaMes).length;
            }
        } catch {
            nuevosMesCount = sociosData.filter(s => new Date(s.fecha_ingreso) >= primerDiaMes).length;
        }
        document.getElementById('nuevosMes').textContent = nuevosMesCount;

        // Contadores de filtros (usar totales globales cuando sea posible)
        document.getElementById('countTodos').textContent = totalTodos ?? sociosData.length;
        document.getElementById('countSocios').textContent = totalSocios ?? sociosData.filter(s => s.tipo === 'socio').length;
        document.getElementById('countClientes').textContent = totalClientes ?? sociosData.filter(s => s.tipo === 'cliente').length;
    } catch (e) {
        console.warn('No se pudieron cargar los totales globales, usando datos de la página actual.', e);
        const socios = sociosData.filter(s => s.tipo === 'socio');
        const clientes = sociosData.filter(s => s.tipo === 'cliente');
        const activos = sociosData.filter(s => s.estado === 'activo');
        const hoy = new Date();
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const nuevosMes = sociosData.filter(s => new Date(s.fecha_ingreso) >= primerDiaMes);
        document.getElementById('totalSocios').textContent = socios.length;
        document.getElementById('totalClientes').textContent = clientes.length;
        document.getElementById('totalActivos').textContent = activos.length;
        document.getElementById('nuevosMes').textContent = nuevosMes.length;
        document.getElementById('countTodos').textContent = sociosData.length;
        document.getElementById('countSocios').textContent = socios.length;
        document.getElementById('countClientes').textContent = clientes.length;
    }
}

// ===================================
// Mostrar Socios en Tabla
// ===================================
function displaySocios(data) {
    const tbody = document.getElementById('sociosTableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem;">
                    <span style="font-size: 3rem;">👥</span>
                    <p style="color: var(--gray-500);">No hay registros para mostrar</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = data.map(socio => {
        const fecha = new Date(socio.fecha_ingreso).toLocaleDateString('es-ES');
        const tipoBadge = socio.tipo === 'socio' ? 'badge-socio' : 'badge-cliente';
        const tipoIcon = socio.tipo === 'socio' ? '👥' : '👤';
        const estadoBadge = `badge-${socio.estado}`;
        
        return `
            <tr>
                <td><strong>#${socio.id}</strong></td>
                <td>${socio.identidad}</td>
                <td><strong>${socio.nombre} ${socio.apellido}</strong></td>
                <td>
                    <span class="badge ${tipoBadge}">
                        ${tipoIcon} ${socio.tipo.toUpperCase()}
                    </span>
                </td>
                <td>${socio.celular || socio.telefono || 'N/A'}</td>
                <td>${socio.email || 'N/A'}</td>
                <td>${fecha}</td>
                <td>
                    <span class="badge ${estadoBadge}">
                        ${socio.estado.toUpperCase()}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action" onclick="viewSocio(${socio.id})" title="Ver detalles">
                            👁️
                        </button>
                        <button class="btn-action" onclick="editSocio(${socio.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="btn-action" onclick="deleteSocio(${socio.id}, '${socio.nombre} ${socio.apellido}')" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ===================================
// Filtrar Tabla
// ===================================
function filterTable() {
    // Modo de filtro cliente para búsqueda rápida
    let filtered = sociosData;
    if (currentFilter !== 'todos') {
        filtered = filtered.filter(s => s.tipo === currentFilter);
    }
    if (currentEstadoFilter !== 'todos') {
        filtered = filtered.filter(s => s.estado === currentEstadoFilter);
    }
    displaySocios(filtered);
}

// ===================================
// Buscar en Tabla
// ===================================
function searchTable(query) {
    if (!query) {
        filterTable();
        return;
    }
    
    query = query.toLowerCase();
    const filtered = sociosData.filter(s => {
        return (
            s.nombre.toLowerCase().includes(query) ||
            s.apellido.toLowerCase().includes(query) ||
            s.identidad.includes(query) ||
            s.telefono.includes(query) ||
            (s.email && s.email.toLowerCase().includes(query))
        );
    });
    
    displaySocios(filtered);
}

// ===================================
// Modal - Nuevo/Editar
// ===================================
function openNewModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Socio/Cliente';
    document.getElementById('formSocio').reset();
    document.getElementById('fecha_ingreso').valueAsDate = new Date();
    toggleSocioSection();
    document.getElementById('modalSocio').classList.add('active');
}

function closeModal() {
    document.getElementById('modalSocio').classList.remove('active');
    currentEditId = null;
}

function toggleSocioSection() {
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    const seccionSocio = document.getElementById('seccionSocio');
    
    if (tipo === 'socio') {
        seccionSocio.style.display = 'block';
        document.getElementById('fecha_ingreso').required = true;
    } else {
        seccionSocio.style.display = 'none';
        document.getElementById('fecha_ingreso').required = false;
    }
}

// ===================================
// Editar Socio
// ===================================
function editSocio(id) {
    const socio = sociosData.find(s => s.id === id);
    if (!socio) return;
    
    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Editar Socio/Cliente';
    
    // Llenar formulario
    document.querySelector(`input[name="tipo"][value="${socio.tipo}"]`).checked = true;
    document.getElementById('identidad').value = socio.identidad;
    document.getElementById('nombre').value = socio.nombre;
    document.getElementById('apellido').value = socio.apellido;
    document.getElementById('fecha_nacimiento').value = socio.fecha_nacimiento;
    document.getElementById('genero').value = socio.genero;
    const estadoEl = document.getElementById('estado');
    if (estadoEl) estadoEl.value = socio.estado;
    document.getElementById('telefono').value = socio.telefono;
    document.getElementById('celular').value = socio.celular || '';
    document.getElementById('email').value = socio.email || '';
    document.getElementById('direccion').value = socio.direccion;
    document.getElementById('ciudad').value = socio.ciudad;
    document.getElementById('departamento').value = socio.departamento;
    document.getElementById('ocupacion').value = socio.ocupacion || '';
    document.getElementById('lugar_trabajo').value = socio.lugar_trabajo || '';
    document.getElementById('ingresos_mensuales').value = socio.ingresos_mensuales || '';
    document.getElementById('fecha_ingreso').value = socio.fecha_ingreso;
    document.getElementById('notas').value = socio.notas || '';
    
    toggleSocioSection();
    document.getElementById('modalSocio').classList.add('active');
}

// ===================================
// Guardar Socio
// ===================================
async function handleSubmit(e) {
    e.preventDefault();
    
    // Validación de campos antes de enviar
    const identidadEl = document.getElementById('identidad');
    const telefonoEl = document.getElementById('telefono');
    const celularEl = document.getElementById('celular');
    const emailEl = document.getElementById('email');
    const nombreEl = document.getElementById('nombre');
    const apellidoEl = document.getElementById('apellido');
    const direccionEl = document.getElementById('direccion');
    const ciudadEl = document.getElementById('ciudad');
    const departamentoEl = document.getElementById('departamento');

    const identidad = identidadEl.value.trim();
    const telefono = telefonoEl.value.trim();
    const celular = celularEl.value.trim();
    const email = emailEl.value.trim();

    if (!/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/.test(identidad)) {
        showNotification('Identidad inválida. Formato: 0000-0000-00000', 'error');
        identidadEl.focus();
        return;
    }
    // Celular obligatorio
    if (!/^[0-9]{4}-[0-9]{4}$/.test(celular)) {
        showNotification('Celular inválido. Formato: 0000-0000', 'error');
        celularEl.focus();
        return;
    }
    // Teléfono opcional
    if (telefono && !/^[0-9]{4}-[0-9]{4}$/.test(telefono)) {
        showNotification('Teléfono inválido. Formato: 0000-0000', 'error');
        telefonoEl.focus();
        return;
    }
    if (email && !isValidEmail(email)) {
        showNotification('Correo inválido. Usa un dominio válido.', 'error');
        emailEl.focus();
        return;
    }
    if (!nombreEl.value.trim() || !apellidoEl.value.trim() || !direccionEl.value.trim() || !ciudadEl.value.trim() || !departamentoEl.value.trim()) {
        showNotification('Completa todos los campos obligatorios.', 'error');
        return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const token = localStorage.getItem('token');
    const baseUrl = API_URL.replace('localhost', '127.0.0.1');
    const url = currentEditId 
        ? `${baseUrl}/api/socios/${currentEditId}`
        : `${baseUrl}/api/socios`;
    const method = currentEditId ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification(
                currentEditId ? 'Registro actualizado exitosamente' : 'Registro creado exitosamente',
                'success'
            );
            closeModal();
            loadSociosData();
        } else {
            let errorText = 'Error al guardar';
            let missing = [];
            try {
                const err = await response.json();
                errorText = err.error || errorText;
                if (Array.isArray(err.campos_faltantes)) missing = err.campos_faltantes;
            } catch {}
            console.error('Guardar socio - respuesta 400/500:', response.status, errorText, missing);
            if (missing.length) {
                // Resaltar y enfocar el primer campo faltante
                const first = missing[0];
                const el = document.getElementById(first);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('input-error');
                    setTimeout(() => el.classList.remove('input-error'), 1500);
                    el.focus();
                }
                showNotification(`${errorText}. Falta(n): ${missing.join(', ')}`, 'error');
            } else {
                showNotification(errorText, 'error');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

// ===================================
// Validaciones de entradas y máscaras
// ===================================
function setupInputValidations() {
    const identidadEl = document.getElementById('identidad');
    const telefonoEl = document.getElementById('telefono');
    const celularEl = document.getElementById('celular');
    const emailEl = document.getElementById('email');
    const nombreEl = document.getElementById('nombre');
    const apellidoEl = document.getElementById('apellido');

    if (identidadEl) {
        identidadEl.addEventListener('input', () => {
            identidadEl.value = maskIdentidad(identidadEl.value);
        });
    }
    if (telefonoEl) {
        telefonoEl.addEventListener('input', () => {
            telefonoEl.value = maskTelefono(telefonoEl.value);
        });
    }
    if (celularEl) {
        celularEl.addEventListener('input', () => {
            celularEl.value = maskTelefono(celularEl.value);
        });
    }
    if (emailEl) {
        emailEl.addEventListener('blur', () => {
            const email = emailEl.value.trim();
            if (email && !isValidEmail(email)) {
                showNotification('Correo inválido. Verifica el dominio.', 'error');
                emailEl.focus();
            }
        });
    }

    // Solo texto para nombre y apellido (letras y espacios)
    const onlyLetters = (value) => value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ\s]/g, '');
    if (nombreEl) {
        nombreEl.addEventListener('input', () => {
            nombreEl.value = onlyLetters(nombreEl.value);
        });
    }
    if (apellidoEl) {
        apellidoEl.addEventListener('input', () => {
            apellidoEl.value = onlyLetters(apellidoEl.value);
        });
    }
}

function maskIdentidad(value) {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    const part1 = digits.slice(0, 4);
    const part2 = digits.slice(4, 8);
    const part3 = digits.slice(8, 13);
    let masked = part1;
    if (part2) masked += '-' + part2;
    if (part3) masked += '-' + part3;
    return masked;
}

function maskTelefono(value) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const part1 = digits.slice(0, 4);
    const part2 = digits.slice(4, 8);
    let masked = part1;
    if (part2) masked += '-' + part2;
    return masked;
}

function isValidEmail(email) {
    // Validación de formato y dominio común
    const basic = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!basic.test(email)) return false;
    const domain = email.split('@')[1].toLowerCase();
    const allowedTLDs = ['com','net','org','edu','gov','hn','es'];
    const tld = domain.split('.').pop();
    return allowedTLDs.includes(tld);
}

// ===================================
// Eliminar Socio
// ===================================
async function deleteSocio(id, nombre) {
    if (!confirm(`¿Está seguro que desea eliminar a ${nombre}?`)) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/api/socios/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showNotification('Registro eliminado exitosamente', 'success');
            loadSociosData();
        } else {
            showNotification('Error al eliminar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

// ===================================
// Ver Detalles
// ===================================
function viewSocio(id) {
    const socio = sociosData.find(s => s.id === id);
    if (!socio) return;
    
    // Actualizar header
    document.getElementById('detallesNombre').textContent = `${socio.nombre} ${socio.apellido}`;
    document.getElementById('detallesIdentidad').textContent = socio.identidad;
    
    const tipoBadge = socio.tipo === 'socio' ? 'badge-socio' : 'badge-cliente';
    const tipoIcon = socio.tipo === 'socio' ? '👥' : '👤';
    document.getElementById('detallesTipo').className = `badge ${tipoBadge}`;
    document.getElementById('detallesTipo').textContent = `${tipoIcon} ${socio.tipo.toUpperCase()}`;
    
    const estadoBadge = `badge-${socio.estado}`;
    document.getElementById('detallesEstado').className = `badge ${estadoBadge}`;
    document.getElementById('detallesEstado').textContent = socio.estado.toUpperCase();
    
    // Llenar datos personales en secciones estructuradas
    const detallesHTML = `
        <div class="details-sections">
            <section class="details-section">
                <h4 class="details-section-title">👤 Datos Personales</h4>
                <div class="details-list">
                    <div class="details-row"><span class="details-key">Fecha de Nacimiento</span><span class="details-value">${new Date(socio.fecha_nacimiento).toLocaleDateString('es-ES')}</span></div>
                    <div class="details-row"><span class="details-key">Género</span><span class="details-value">${socio.genero === 'M' ? 'Masculino' : socio.genero === 'F' ? 'Femenino' : 'Otro'}</span></div>
                </div>
            </section>

            <section class="details-section">
                <h4 class="details-section-title">📞 Contacto</h4>
                <div class="details-list">
                    <div class="details-row"><span class="details-key">Celular</span><span class="details-value">${socio.celular || 'N/A'}</span></div>
                    <div class="details-row"><span class="details-key">Teléfono</span><span class="details-value">${socio.telefono || 'N/A'}</span></div>
                    <div class="details-row"><span class="details-key">Email</span><span class="details-value">${socio.email || 'N/A'}</span></div>
                </div>
            </section>

            <section class="details-section">
                <h4 class="details-section-title">📍 Dirección</h4>
                <div class="details-list">
                    <div class="details-row"><span class="details-key">Departamento</span><span class="details-value">${socio.departamento}</span></div>
                    <div class="details-row"><span class="details-key">Ciudad</span><span class="details-value">${socio.ciudad}</span></div>
                    <div class="details-row details-row-full"><span class="details-key">Dirección</span><span class="details-value">${socio.direccion}</span></div>
                </div>
            </section>

            <section class="details-section">
                <h4 class="details-section-title">🧑‍💼 Información Laboral</h4>
                <div class="details-list">
                    <div class="details-row"><span class="details-key">Ocupación</span><span class="details-value">${socio.ocupacion || 'N/A'}</span></div>
                    <div class="details-row"><span class="details-key">Lugar de Trabajo</span><span class="details-value">${socio.lugar_trabajo || 'N/A'}</span></div>
                    <div class="details-row"><span class="details-key">Ingresos Mensuales</span><span class="details-value">${socio.ingresos_mensuales ? formatCurrency(socio.ingresos_mensuales) : 'N/A'}</span></div>
                </div>
            </section>

            <section class="details-section">
                <h4 class="details-section-title">🎟️ Membresía</h4>
                <div class="details-list">
                    <div class="details-row"><span class="details-key">Fecha de Ingreso</span><span class="details-value">${socio.fecha_ingreso ? new Date(socio.fecha_ingreso).toLocaleDateString('es-ES') : 'N/A'}</span></div>
                </div>
            </section>
        </div>
    `;
    
    document.getElementById('detallesPersonales').innerHTML = detallesHTML;

    // Preparar tabs con estructura ordenada
    // Cargar datos reales para tabs
    const cuentasHTML = `
        <div class="details-sections">
            <section class="details-section">
                <h4 class="details-section-title">💳 Cuentas</h4>
                <div class="details-list" id="listaCuentas">
                    <div class="details-row details-row-full">
                        <span class="details-key">Cargando</span>
                        <span class="details-value">Cuentas...</span>
                    </div>
                </div>
            </section>
        </div>`;

    const prestamosHTML = `
        <div class="details-sections">
            <section class="details-section">
                <h4 class="details-section-title">🧾 Préstamos</h4>
                <div class="details-list" id="listaPrestamos">
                    <div class="details-row details-row-full">
                        <span class="details-key">Cargando</span>
                        <span class="details-value">Préstamos...</span>
                    </div>
                </div>
            </section>
        </div>`;

    const historialHTML = `
        <div class="details-sections">
            <section class="details-section">
                <h4 class="details-section-title">📚 Historial</h4>
                <div class="details-list">
                    <div class="details-row">
                        <span class="details-key">Última actualización</span>
                        <span class="details-value">${new Date().toLocaleDateString('es-ES')}</span>
                    </div>
                    <div class="details-row">
                        <span class="details-key">Notas</span>
                        <span class="details-value">${socio.notas || 'Sin notas registradas'}</span>
                    </div>
                </div>
            </section>
        </div>`;

    const tabCuentas = document.getElementById('tabCuentas');
    const tabPrestamos = document.getElementById('tabPrestamos');
    const tabHistorial = document.getElementById('tabHistorial');
    if (tabCuentas) tabCuentas.innerHTML = cuentasHTML;
    if (tabPrestamos) tabPrestamos.innerHTML = prestamosHTML;
    if (tabHistorial) tabHistorial.innerHTML = historialHTML;

    // Fetch cuentas por socio (backend soporta filtro id_socio)
    (async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = API_URL.replace('localhost','127.0.0.1');
            const cuentasRes = await fetch(`${baseUrl}/api/cuentas?id_socio=${socio.id}&limite=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const listaCuentasEl = document.getElementById('listaCuentas');
            if (cuentasRes.ok) {
                const cuentasJson = await cuentasRes.json();
                const cuentas = cuentasJson.cuentas || [];
                if (!cuentas.length) {
                    listaCuentasEl.innerHTML = `
                        <div class='details-row details-row-full'>
                            <span class='details-key'>Estado</span>
                            <span class='details-value'>Sin cuentas registradas</span>
                        </div>`;
                } else {
                    listaCuentasEl.innerHTML = cuentas.map(c => `
                        <div class='details-row'>
                            <span class='details-key'>Número</span>
                            <span class='details-value'>${c.numero_cuenta}</span>
                        </div>
                        <div class='details-row'>
                            <span class='details-key'>Tipo</span>
                            <span class='details-value'>${(c.tipo || c.tipo_cuenta || '').toString().replace('_',' ').toUpperCase()}</span>
                        </div>
                        <div class='details-row'>
                            <span class='details-key'>Saldo</span>
                            <span class='details-value'>${formatCurrency(c.saldo || 0)}</span>
                        </div>
                        <div class='details-row'>
                            <span class='details-key'>Estado</span>
                            <span class='details-value'>${(c.estado || 'activa').toUpperCase()}</span>
                        </div>
                    `).join('');
                }
            } else {
                listaCuentasEl.innerHTML = `<div class='details-row details-row-full'><span class='details-key'>Error</span><span class='details-value'>No se pudieron cargar las cuentas</span></div>`;
            }
        } catch (e) {
            const listaCuentasEl = document.getElementById('listaCuentas');
            if (listaCuentasEl) listaCuentasEl.innerHTML = `<div class='details-row details-row-full'><span class='details-key'>Error</span><span class='details-value'>${e.message}</span></div>`;
        }
    })();

    // Fetch préstamos y filtrar por id_socio (ruta no tiene filtro, se filtra cliente)
    (async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = API_URL.replace('localhost','127.0.0.1');
            const presRes = await fetch(`${baseUrl}/api/prestamos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const listaPrestamosEl = document.getElementById('listaPrestamos');
            if (presRes.ok) {
                const prestamos = await presRes.json();
                const propios = prestamos.filter(p => p.id_socio === socio.id);
                if (!propios.length) {
                    listaPrestamosEl.innerHTML = `
                        <div class='details-row details-row-full'>
                            <span class='details-key'>Estado</span>
                            <span class='details-value'>Sin préstamos registrados</span>
                        </div>`;
                } else {
                    listaPrestamosEl.innerHTML = propios.map(p => `
                        <div class='details-row'>
                            <span class='details-key'>Número</span>
                            <span class='details-value'>${p.numero_prestamo}</span>
                        </div>
                        <div class='details-row'>
                            <span class='details-key'>Monto</span>
                            <span class='details-value'>${formatCurrency(p.monto || 0)}</span>
                        </div>
                        <div class='details-row'>
                            <span class='details-key'>Cuota</span>
                            <span class='details-value'>${formatCurrency(p.cuota_mensual || 0)}</span>
                        </div>
                        <div class='details-row'>
                            <span class='details-key'>Estado</span>
                            <span class='details-value'>${(p.estado || '').toUpperCase()}</span>
                        </div>
                    `).join('');
                }
            } else {
                listaPrestamosEl.innerHTML = `<div class='details-row details-row-full'><span class='details-key'>Error</span><span class='details-value'>No se pudieron cargar los préstamos</span></div>`;
            }
        } catch (e) {
            const listaPrestamosEl = document.getElementById('listaPrestamos');
            if (listaPrestamosEl) listaPrestamosEl.innerHTML = `<div class='details-row details-row-full'><span class='details-key'>Error</span><span class='details-value'>${e.message}</span></div>`;
        }
    })();
    
    // Botón editar
    document.getElementById('btnEditarDetalles').onclick = () => {
        closeDetallesModal();
        editSocio(id);
    };
    
    document.getElementById('modalDetalles').classList.add('active');
}

function closeDetallesModal() {
    document.getElementById('modalDetalles').classList.remove('active');
}

function switchTab(tab) {
    // Desactivar todos los tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Activar tab seleccionado
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
}

// ===================================
// Exportar Datos (CSV, EXCEL, PDF)
// ===================================

// Columnas para exportación
const COLUMNAS_SOCIOS = [
    { key: 'id', header: 'ID' },
    { key: 'numero_identidad', header: 'Identidad' },
    { key: 'nombre_completo', header: 'Nombre Completo' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'email', header: 'Email' },
    { key: 'fecha_ingreso_fmt', header: 'Fecha Ingreso', tipo: 'fecha' },
    { key: 'estado', header: 'Estado' }
];

function prepararDatosExportacion() {
    return sociosData.map(s => ({
        id: s.id,
        numero_identidad: s.numero_identidad || '',
        nombre_completo: `${s.nombre || ''} ${s.apellido || ''}`.trim(),
        tipo: s.tipo === 'socio' ? 'Socio' : 'Cliente',
        telefono: s.telefono || '',
        email: s.email || '',
        fecha_ingreso_fmt: s.fecha_ingreso ? new Date(s.fecha_ingreso).toLocaleDateString('es-HN') : '',
        estado: s.estado ? s.estado.charAt(0).toUpperCase() + s.estado.slice(1) : ''
    }));
}

function exportarCSV() {
    const datos = prepararDatosExportacion();
    if (window.COOP_UTILS) {
        window.COOP_UTILS.exportarCSV(datos, 'socios_coop_smart', COLUMNAS_SOCIOS);
    } else {
        showNotification('Error al exportar CSV', 'error');
    }
}

function exportarExcel() {
    const datos = prepararDatosExportacion();
    if (window.COOP_UTILS) {
        window.COOP_UTILS.exportarExcel(datos, 'socios_coop_smart', COLUMNAS_SOCIOS, 'Socios');
    } else {
        showNotification('La librería de Excel no está disponible', 'error');
    }
}

function exportarPDF() {
    const datos = prepararDatosExportacion();
    if (window.COOP_UTILS) {
        window.COOP_UTILS.exportarPDF(datos, 'socios_coop_smart', COLUMNAS_SOCIOS, {
            titulo: 'Listado de Socios y Clientes - COOP-SMART',
            orientacion: 'landscape'
        });
    } else {
        showNotification('La librería de PDF no está disponible', 'error');
    }
}

// ===================================
// Utilidades
// ===================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL'
    }).format(amount);
}

function showNotification(message, type = 'info') {
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
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

console.log('✅ Módulo de Socios/Clientes cargado correctamente');

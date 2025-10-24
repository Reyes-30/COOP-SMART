/**
 * COOP-SMART - Módulo de Socios/Clientes
 * Funcionalidad completa para gestión de socios y clientes
 */

// ===================================
// Configuración API
// ===================================
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://coop-smart.vercel.app';
let currentFilter = 'todos';
let currentEstadoFilter = 'todos';
let sociosData = [];
let currentEditId = null;

// ===================================
// Inicialización
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    checkAuth();
    
    // Cargar datos del usuario
    loadUserData();
    
    // Cargar datos
    loadSociosData();
    
    // Event listeners
    setupEventListeners();
});

// ===================================
// Autenticación
// ===================================
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

function loadUserData() {
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    document.querySelectorAll('#userName').forEach(el => {
        el.textContent = user.nombre_completo || 'Usuario';
    });
    document.querySelectorAll('#userRole').forEach(el => {
        el.textContent = translateRole(user.rol) || 'Usuario';
    });
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
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });
    
    // Mobile menu
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            filterTable();
        });
    });
    
    document.getElementById('estadoFilter').addEventListener('change', (e) => {
        currentEstadoFilter = e.target.value;
        filterTable();
    });
    
    // Búsqueda global
    document.getElementById('globalSearch').addEventListener('input', (e) => {
        searchTable(e.target.value);
    });
    
    // Botones
    document.getElementById('btnNuevo').addEventListener('click', openNewModal);
    document.getElementById('btnExportar').addEventListener('click', exportarDatos);
    
    // Modal
    document.getElementById('btnCloseModal').addEventListener('click', closeModal);
    document.getElementById('btnCancelar').addEventListener('click', closeModal);
    document.getElementById('formSocio').addEventListener('submit', handleSubmit);
    
    // Modal Detalles
    document.getElementById('btnCloseDetalles').addEventListener('click', closeDetallesModal);
    
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
}

function handleLogout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    }
}

// ===================================
// Cargar Datos
// ===================================
async function loadSociosData() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/api/socios`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            sociosData = await response.json();
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

// ===================================
// Actualizar Estadísticas
// ===================================
function updateStats() {
    const socios = sociosData.filter(s => s.tipo === 'socio');
    const clientes = sociosData.filter(s => s.tipo === 'cliente');
    const activos = sociosData.filter(s => s.estado === 'activo');
    
    // Nuevos este mes
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const nuevosMes = sociosData.filter(s => new Date(s.fecha_ingreso) >= primerDiaMes);
    
    document.getElementById('totalSocios').textContent = socios.length;
    document.getElementById('totalClientes').textContent = clientes.length;
    document.getElementById('totalActivos').textContent = activos.length;
    document.getElementById('nuevosMes').textContent = nuevosMes.length;
    
    // Actualizar contadores de filtros
    document.getElementById('countTodos').textContent = sociosData.length;
    document.getElementById('countSocios').textContent = socios.length;
    document.getElementById('countClientes').textContent = clientes.length;
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
                <td>${socio.telefono}</td>
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
    let filtered = sociosData;
    
    // Filtrar por tipo
    if (currentFilter !== 'todos') {
        filtered = filtered.filter(s => s.tipo === currentFilter);
    }
    
    // Filtrar por estado
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
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const token = localStorage.getItem('token');
    const url = currentEditId 
        ? `${API_URL}/api/socios/${currentEditId}`
        : `${API_URL}/api/socios`;
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
            const error = await response.json();
            showNotification(error.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
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
    
    // Llenar datos personales
    const detallesHTML = `
        <div class="detail-item">
            <div class="detail-label">Fecha de Nacimiento</div>
            <div class="detail-value">${new Date(socio.fecha_nacimiento).toLocaleDateString('es-ES')}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Género</div>
            <div class="detail-value">${socio.genero === 'M' ? 'Masculino' : socio.genero === 'F' ? 'Femenino' : 'Otro'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Teléfono</div>
            <div class="detail-value">${socio.telefono}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Celular</div>
            <div class="detail-value">${socio.celular || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Email</div>
            <div class="detail-value">${socio.email || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Ciudad</div>
            <div class="detail-value">${socio.ciudad}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Departamento</div>
            <div class="detail-value">${socio.departamento}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Dirección</div>
            <div class="detail-value">${socio.direccion}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Ocupación</div>
            <div class="detail-value">${socio.ocupacion || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Lugar de Trabajo</div>
            <div class="detail-value">${socio.lugar_trabajo || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Ingresos Mensuales</div>
            <div class="detail-value">${socio.ingresos_mensuales ? formatCurrency(socio.ingresos_mensuales) : 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Fecha de Ingreso</div>
            <div class="detail-value">${new Date(socio.fecha_ingreso).toLocaleDateString('es-ES')}</div>
        </div>
    `;
    
    document.getElementById('detallesPersonales').innerHTML = detallesHTML;
    
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
// Exportar Datos
// ===================================
function exportarDatos() {
    showNotification('Función de exportación en desarrollo', 'info');
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

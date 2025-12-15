/**
 * COOP-SMART - Utilidades Compartidas
 * Funciones de exportación, roles y helpers comunes
 */

// ===================================
// Configuración API
// ===================================
const UTILS_API_URL = (window.location.hostname === 'localhost' || window.location.protocol === 'file:')
    ? 'http://localhost:3000' 
    : 'https://coop-smart.vercel.app';

// ===================================
// SISTEMA DE ROLES Y PERMISOS
// ===================================
const ROLES = {
    ADMINISTRADOR: 'administrador',
    CAJERO: 'cajero',
    SOCIO: 'socio'
};

const PERMISOS = {
    // Socios
    SOCIOS_VER: ['administrador', 'cajero', 'socio'],
    SOCIOS_CREAR: ['administrador', 'cajero'],
    SOCIOS_EDITAR: ['administrador', 'cajero'],
    SOCIOS_ELIMINAR: ['administrador'],
    
    // Cuentas
    CUENTAS_VER: ['administrador', 'cajero', 'socio'],
    CUENTAS_CREAR: ['administrador', 'cajero'],
    CUENTAS_EDITAR: ['administrador', 'cajero'],
    CUENTAS_TRANSACCION: ['administrador', 'cajero'],
    CUENTAS_BLOQUEAR: ['administrador'],
    
    // Préstamos
    PRESTAMOS_VER: ['administrador', 'cajero', 'socio'],
    PRESTAMOS_CREAR: ['administrador', 'cajero'],
    PRESTAMOS_APROBAR: ['administrador'],
    PRESTAMOS_RECHAZAR: ['administrador'],
    
    // Transacciones
    TRANSACCIONES_VER: ['administrador', 'cajero', 'socio'],
    TRANSACCIONES_CREAR: ['administrador', 'cajero'],
    
    // Pagos
    PAGOS_VER: ['administrador', 'cajero', 'socio'],
    PAGOS_REGISTRAR: ['administrador', 'cajero'],
    
    // Reportes
    REPORTES_VER: ['administrador', 'cajero'],
    REPORTES_EXPORTAR: ['administrador', 'cajero'],
    
    // Dashboard
    DASHBOARD_COMPLETO: ['administrador', 'cajero'],
    DASHBOARD_LIMITADO: ['socio']
};

/**
 * Obtiene el usuario actual del localStorage
 */
function obtenerUsuarioActual() {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Verifica si el usuario tiene un permiso específico
 */
function tienePermiso(permiso) {
    const usuario = obtenerUsuarioActual();
    if (!usuario || !usuario.rol) return false;
    
    const rolesPermitidos = PERMISOS[permiso];
    if (!rolesPermitidos) return false;
    
    return rolesPermitidos.includes(usuario.rol);
}

/**
 * Aplica permisos a elementos del DOM
 * Oculta elementos que el usuario no tiene permiso de ver
 */
function aplicarPermisos() {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return;
    
    // Elementos con data-permiso
    document.querySelectorAll('[data-permiso]').forEach(el => {
        const permiso = el.dataset.permiso;
        if (!tienePermiso(permiso)) {
            el.style.display = 'none';
        }
    });
    
    // Elementos con data-rol (solo visible para roles específicos)
    document.querySelectorAll('[data-rol]').forEach(el => {
        const rolesStr = el.dataset.rol;
        const roles = rolesStr.split(',').map(r => r.trim());
        if (!roles.includes(usuario.rol)) {
            el.style.display = 'none';
        }
    });
}

// ===================================
// EXPORTACIÓN DE DATOS
// ===================================

/**
 * Exportar a CSV
 * @param {Array} datos - Array de objetos
 * @param {string} nombreArchivo - Nombre del archivo sin extensión
 * @param {Array} columnas - Array de {key, header} para definir columnas
 */
function exportarCSV(datos, nombreArchivo, columnas) {
    if (!datos || datos.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'warning');
        return;
    }
    
    // Crear encabezados
    const headers = columnas.map(c => c.header).join(',');
    
    // Crear filas
    const filas = datos.map(item => {
        return columnas.map(c => {
            let valor = item[c.key];
            // Escapar comas y comillas
            if (typeof valor === 'string' && (valor.includes(',') || valor.includes('"'))) {
                valor = `"${valor.replace(/"/g, '""')}"`;
            }
            return valor ?? '';
        }).join(',');
    });
    
    // Combinar
    const csv = [headers, ...filas].join('\n');
    
    // Descargar
    descargarArchivo(csv, `${nombreArchivo}.csv`, 'text/csv;charset=utf-8;');
    mostrarNotificacion('Archivo CSV exportado correctamente', 'success');
}

/**
 * Exportar a Excel (XLSX)
 * Requiere SheetJS (xlsx.js)
 * @param {Array} datos - Array de objetos
 * @param {string} nombreArchivo - Nombre del archivo sin extensión
 * @param {Array} columnas - Array de {key, header} para definir columnas
 * @param {string} nombreHoja - Nombre de la hoja de Excel
 */
function exportarExcel(datos, nombreArchivo, columnas, nombreHoja = 'Datos') {
    if (!datos || datos.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'warning');
        return;
    }
    
    // Verificar que XLSX esté disponible
    if (typeof XLSX === 'undefined') {
        mostrarNotificacion('Error: Librería XLSX no cargada', 'error');
        console.error('SheetJS (XLSX) no está disponible. Incluye la librería.');
        return;
    }
    
    // Preparar datos con encabezados
    const datosFormateados = datos.map(item => {
        const fila = {};
        columnas.forEach(c => {
            fila[c.header] = item[c.key] ?? '';
        });
        return fila;
    });
    
    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosFormateados);
    
    // Ajustar anchos de columna
    const anchos = columnas.map(c => ({ wch: Math.max(c.header.length, 15) }));
    ws['!cols'] = anchos;
    
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    
    // Descargar
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
    mostrarNotificacion('Archivo Excel exportado correctamente', 'success');
}

/**
 * Exportar a PDF
 * Requiere jsPDF y jsPDF-AutoTable
 * @param {Array} datos - Array de objetos
 * @param {string} nombreArchivo - Nombre del archivo sin extensión
 * @param {Array} columnas - Array de {key, header} para definir columnas
 * @param {Object} opciones - Opciones adicionales (titulo, orientacion)
 */
function exportarPDF(datos, nombreArchivo, columnas, opciones = {}) {
    if (!datos || datos.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'warning');
        return;
    }
    
    // Verificar que jsPDF esté disponible
    if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
        mostrarNotificacion('Error: Librería jsPDF no cargada', 'error');
        console.error('jsPDF no está disponible. Incluye la librería.');
        return;
    }
    
    const { jsPDF } = window.jspdf || window;
    
    const titulo = opciones.titulo || nombreArchivo;
    const orientacion = opciones.orientacion || 'portrait';
    
    const doc = new jsPDF(orientacion, 'mm', 'a4');
    
    // Título
    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text(titulo, 14, 15);
    
    // Subtítulo con fecha
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generado: ${new Date().toLocaleString('es-HN')}`, 14, 22);
    
    // Empresa
    doc.setFontSize(10);
    doc.text('COOP-SMART - Sistema de Gestión Cooperativa', 14, 28);
    
    // Preparar datos para la tabla
    const headers = columnas.map(c => c.header);
    const filas = datos.map(item => columnas.map(c => {
        const valor = item[c.key];
        // Formatear según tipo
        if (c.tipo === 'moneda') {
            return formatearMonedaSimple(valor);
        }
        if (c.tipo === 'fecha') {
            return formatearFechaSimple(valor);
        }
        return valor ?? '';
    }));
    
    // Generar tabla
    doc.autoTable({
        head: [headers],
        body: filas,
        startY: 35,
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [30, 64, 175],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251]
        },
        margin: { left: 14, right: 14 }
    });
    
    // Pie de página
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${totalPaginas}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }
    
    // Descargar
    doc.save(`${nombreArchivo}.pdf`);
    mostrarNotificacion('Archivo PDF exportado correctamente', 'success');
}

// ===================================
// HELPERS DE FORMATO
// ===================================

function formatearMonedaSimple(valor) {
    const num = parseFloat(valor) || 0;
    return `L. ${num.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatearFechaSimple(fecha) {
    if (!fecha) return '';
    try {
        return new Date(fecha).toLocaleDateString('es-HN');
    } catch {
        return fecha;
    }
}

function descargarArchivo(contenido, nombreArchivo, tipo) {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ===================================
// NOTIFICACIONES
// ===================================

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Verificar si ya existe función showNotification en el scope
    if (typeof showNotification === 'function') {
        showNotification(mensaje, tipo);
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${tipo === 'error' ? '#EF4444' : tipo === 'success' ? '#10B981' : tipo === 'warning' ? '#F59E0B' : '#3B82F6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-in-out;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    const iconos = { error: '❌', success: '✅', warning: '⚠️', info: 'ℹ️' };
    notification.innerHTML = `
        <span style="font-size: 1.25rem;">${iconos[tipo] || 'ℹ️'}</span>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in-out';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===================================
// INICIALIZACIÓN AUTOMÁTICA
// ===================================

// Aplicar permisos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    aplicarPermisos();
});

// Exportar funciones para uso global
window.COOP_UTILS = {
    ROLES,
    PERMISOS,
    tienePermiso,
    aplicarPermisos,
    obtenerUsuarioActual,
    exportarCSV,
    exportarExcel,
    exportarPDF,
    mostrarNotificacion,
    formatearMonedaSimple,
    formatearFechaSimple
};

console.log('✅ COOP-SMART Utils cargado correctamente');

# 📊 Módulo de Reportes - COOP-SMART

## 📋 Descripción General

El **Módulo de Reportes** es una característica completa que permite generar reportes profesionales con visualizaciones gráficas interactivas y capacidad de exportación a PDF y Excel.

---

## ✨ Características Principales

### 📈 **10 Tipos de Reportes Disponibles**

1. **📊 Resumen Financiero General**
   - Vista consolidada del estado de la cooperativa
   - Estadísticas de socios, cuentas, préstamos
   - Gráficas de pagos y transacciones del período

2. **👥 Análisis de Socios**
   - Distribución por estado (Activo, Inactivo, Suspendido)
   - Gráfica de crecimiento de socios (últimos 12 meses)

3. **💳 Cuentas por Tipo**
   - Análisis de cuentas de Ahorro, Corriente y Plazo Fijo
   - Saldos totales, promedios, máximos y mínimos
   - Gráficas de distribución y comparación

4. **💵 Préstamos Detallado**
   - Listado completo de préstamos con filtros de fecha
   - Información de socios, montos, tasas, cuotas
   - Total pagado y saldo pendiente

5. **📉 Préstamos en Mora**
   - Préstamos con pagos vencidos
   - Días de mora calculados automáticamente
   - Información de contacto para seguimiento

6. **💸 Pagos por Período**
   - Evolución mensual de pagos
   - Gráfica de tendencia temporal
   - Totales y promedios por mes

7. **📝 Transacciones por Tipo**
   - Análisis de Depósitos, Retiros y Transferencias
   - Gráficas de distribución y montos
   - Filtros por período

8. **📈 Evolución de Saldos**
   - Comparación mensual de depósitos vs retiros
   - Gráfica de líneas con áreas rellenas
   - Análisis de flujo de efectivo

9. **🏆 Top 10 Socios**
   - Ranking de socios por saldo total
   - Información de cuentas y préstamos
   - Análisis de deuda

10. **📈 Crecimiento de Socios**
    - Nuevos socios por mes
    - Tendencia de crecimiento

---

## 🎨 Visualizaciones (Chart.js)

### Tipos de Gráficas Implementadas:

- **📊 Gráficas de Dona (Doughnut)**
  - Distribución de socios por estado
  - Cuentas por tipo
  - Transacciones por tipo
  - Pagos vs pendientes

- **📊 Gráficas de Barras (Bar)**
  - Saldos por tipo de cuenta
  - Montos de transacciones

- **📈 Gráficas de Línea (Line)**
  - Crecimiento de socios
  - Evolución de pagos mensuales
  - Depósitos vs Retiros

### Características de las Gráficas:

- ✅ Interactivas (tooltips al pasar el mouse)
- ✅ Responsive (se adaptan al tamaño de pantalla)
- ✅ Paleta de colores profesional
- ✅ Leyendas claras
- ✅ Animaciones suaves

---

## 📥 Exportación de Reportes

### 📄 Exportación a PDF (jsPDF)

**Características:**
- ✅ Encabezado personalizado con logo COOP-SMART
- ✅ Fecha y hora de generación
- ✅ Tablas formateadas automáticamente
- ✅ Soporte para múltiples páginas
- ✅ Formato profesional listo para imprimir

**Reportes soportados en PDF:**
- Cuentas por Tipo
- Préstamos Detallado
- Préstamos en Mora
- Top Socios

### 📊 Exportación a Excel (SheetJS/XLSX)

**Características:**
- ✅ Formato .xlsx compatible con Microsoft Excel
- ✅ Encabezados de columna automáticos
- ✅ Datos estructurados en hojas
- ✅ Listo para análisis adicional
- ✅ Filtros y ordenamiento en Excel

**Reportes soportados en Excel:**
- Cuentas por Tipo
- Préstamos Detallado
- Préstamos en Mora
- Top Socios
- Pagos por Período

---

## 🔧 Estructura Técnica

### Backend

**Archivo:** `backend/src/controllers/reportesController.js`

```javascript
// 10 funciones principales:
- getResumenFinanciero()
- getSociosPorEstado()
- getCuentasPorTipo()
- getPrestamosDetallado()
- getPrestamosEnMora()
- getPagosPorPeriodo()
- getTransaccionesPorTipo()
- getEvolucionSaldos()
- getTopSocios()
- getEstadisticasCrecimiento()
```

**Archivo:** `backend/src/routes/reportes.routes.js`

```javascript
// Rutas de la API:
GET /api/reportes/resumen-financiero
GET /api/reportes/socios-por-estado
GET /api/reportes/cuentas-por-tipo
GET /api/reportes/prestamos-detallado
GET /api/reportes/prestamos-mora
GET /api/reportes/pagos-periodo
GET /api/reportes/transacciones-tipo
GET /api/reportes/evolucion-saldos
GET /api/reportes/top-socios
GET /api/reportes/crecimiento
```

### Frontend

**Archivos:**
- `frontend/reportes.html` - Estructura HTML
- `frontend/reportes.css` - Estilos personalizados
- `frontend/reportes.js` - Lógica y funcionalidades

**Librerías CDN Utilizadas:**
- Chart.js v4.4.0 - Gráficas interactivas
- jsPDF v2.5.1 - Exportación a PDF
- jsPDF-AutoTable v3.8.2 - Tablas en PDF
- SheetJS (XLSX) v0.18.5 - Exportación a Excel
- html2canvas v1.4.1 - Captura de gráficas

---

## 🎯 Uso del Módulo

### 1. Acceso al Módulo
- Navegar a `reportes.html` desde el menú lateral
- Requiere autenticación (token JWT)
- Disponible para todos los roles

### 2. Generar un Reporte

```
1. Seleccionar fechas de inicio y fin
2. Elegir tipo de reporte del selector
3. Clic en "🔄 Generar Reporte"
4. Ver visualización en pantalla
```

### 3. Exportar Reporte

**PDF:**
```
1. Generar reporte primero
2. Clic en "📄 Exportar PDF"
3. Se descarga automáticamente
```

**Excel:**
```
1. Generar reporte primero
2. Clic en "📊 Exportar Excel"
3. Se descarga archivo .xlsx
```

---

## 🔍 Filtros Disponibles

### Filtros Globales:
- **📅 Fecha Inicio:** Fecha de inicio del período
- **📅 Fecha Fin:** Fecha de fin del período
- **📊 Tipo de Reporte:** Selector de los 10 tipos

### Filtros por Defecto:
- Las fechas se establecen al **mes actual** por defecto
- Pueden modificarse para cualquier rango personalizado

---

## 📊 Ejemplos de Consultas SQL

### Resumen Financiero:
```sql
SELECT 
    COUNT(*) as total_socios_activos,
    SUM(saldo) as saldo_total_cuentas,
    COUNT(DISTINCT prestamos.id) as prestamos_activos
FROM socios
LEFT JOIN cuentas ON socios.id = cuentas.socio_id
LEFT JOIN prestamos ON socios.id = prestamos.socio_id
WHERE socios.estado = 'Activo'
```

### Préstamos en Mora:
```sql
SELECT 
    prestamos.*,
    socios.nombre,
    DATEDIFF(CURDATE(), fecha_siguiente_pago) as dias_mora
FROM prestamos
INNER JOIN socios ON prestamos.socio_id = socios.id
WHERE estado = 'Aprobado'
    AND DATEDIFF(CURDATE(), fecha_siguiente_pago) > 0
ORDER BY dias_mora DESC
```

---

## 🎨 Diseño Visual

### Paleta de Colores:

| Elemento | Color | Uso |
|----------|-------|-----|
| Azul | `#3498db` | Primario, gráficas |
| Verde | `#27ae60` | Éxito, aprobados |
| Naranja | `#e67e22` | Advertencia |
| Rojo | `#e74c3c` | Error, mora |
| Morado | `#9b59b6` | Acento |
| Gris | `#95a5a6` | Neutral |

### Tarjetas de Estadísticas:
- Fondos degradados suaves
- Bordes de colores según categoría
- Iconos emoji grandes
- Números destacados
- Efecto hover con elevación

---

## 📱 Responsive Design

- ✅ Desktop (> 1200px) - 2-3 columnas
- ✅ Tablet (768px - 1200px) - 2 columnas
- ✅ Mobile (< 768px) - 1 columna
- ✅ Gráficas adaptables
- ✅ Tablas con scroll horizontal en móvil

---

## 🚀 Rendimiento

### Optimizaciones:
- **Queries SQL optimizadas** con joins eficientes
- **Carga diferida** de gráficas (solo cuando se necesitan)
- **Destrucción de instancias** de Chart.js antes de recrear
- **Caché de datos** en variable `datosActualesReporte`
- **Compresión** de respuestas HTTP

### Tiempos Estimados:
- Carga de reporte simple: ~200-500ms
- Reporte con gráficas: ~500-1000ms
- Exportación PDF: ~1-2s
- Exportación Excel: ~500ms-1s

---

## 🔒 Seguridad

- ✅ Autenticación JWT requerida
- ✅ Validación de tokens en backend
- ✅ Queries parametrizadas (previene SQL injection)
- ✅ CORS configurado
- ✅ Headers de seguridad (Helmet.js)

---

## 🐛 Solución de Problemas

### Error: "Primero genera un reporte"
**Solución:** Hacer clic en "Generar Reporte" antes de exportar

### Error: Las gráficas no se muestran
**Solución:** Verificar que Chart.js se cargó correctamente (CDN)

### Error: "Error al generar reporte"
**Solución:** 
1. Verificar que el backend esté ejecutándose
2. Comprobar token de autenticación
3. Revisar fechas de filtros

### Error: PDF vacío
**Solución:** Asegurarse de que el tipo de reporte soporte exportación a PDF

---

## 📈 Estadísticas del Módulo

- **Líneas de código:**
  - Backend: ~400 líneas
  - Frontend HTML: ~500 líneas
  - Frontend CSS: ~450 líneas
  - Frontend JS: ~800 líneas
  - **Total: ~2,150 líneas**

- **Endpoints de API:** 10
- **Tipos de reportes:** 10
- **Tipos de gráficas:** 3 (Dona, Barras, Líneas)
- **Formatos de exportación:** 2 (PDF, Excel)
- **Librerías externas:** 5

---

## 🔮 Futuras Mejoras

### Fase 2:
- [ ] Agregar filtros adicionales (por socio, por estado)
- [ ] Reportes programados (envío por email)
- [ ] Más tipos de gráficas (área, radar, scatter)
- [ ] Dashboard de reportes favoritos
- [ ] Comparación de períodos

### Fase 3:
- [ ] Exportación a CSV
- [ ] Impresión directa
- [ ] Reportes personalizables
- [ ] Gráficas en tiempo real (WebSocket)
- [ ] Integración con BI tools

---

## 📞 Soporte

Para preguntas o problemas con el módulo de reportes:

- **Desarrollador:** Josué Ramos
- **Proyecto:** COOP-SMART
- **Versión:** 1.0.0
- **Fecha:** Noviembre 2025

---

## 📄 Licencia

Este módulo es parte del sistema COOP-SMART desarrollado con fines académicos.

**Universidad Nacional Autónoma de Honduras (UNAH)**  
**Materia:** Análisis y Diseño de Sistemas

---

**¡Reportes profesionales al alcance de un clic! 📊✨**

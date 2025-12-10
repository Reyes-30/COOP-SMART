/**
 * Rutas de Reportes
 * Endpoints para generar diferentes tipos de reportes con datos agregados
 */

const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { verificarToken } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// 📊 Resumen Financiero General
router.get('/resumen-financiero', reportesController.getResumenFinanciero);

// 👥 Socios
router.get('/socios-por-estado', reportesController.getSociosPorEstado);
router.get('/top-socios', reportesController.getTopSocios);
router.get('/crecimiento', reportesController.getEstadisticasCrecimiento);

// 💳 Cuentas
router.get('/cuentas-por-tipo', reportesController.getCuentasPorTipo);

// 💵 Préstamos
router.get('/prestamos-detallado', reportesController.getPrestamosDetallado);
router.get('/prestamos-mora', reportesController.getPrestamosEnMora);

// 💸 Pagos
router.get('/pagos-periodo', reportesController.getPagosPorPeriodo);

// 📝 Transacciones
router.get('/transacciones-tipo', reportesController.getTransaccionesPorTipo);
router.get('/evolucion-saldos', reportesController.getEvolucionSaldos);

// 💰 Análisis Financiero Avanzado
router.get('/rentabilidad', reportesController.getAnalisisRentabilidad);
router.get('/prestamos-rango-monto', reportesController.getPrestamosRangoMonto);
router.get('/comparativa-mensual', reportesController.getComparativaMensual);
router.get('/resumen-ejecutivo', reportesController.getResumenEjecutivo);

// 👤 Reportes Individuales
router.get('/estado-cuenta-socio', reportesController.getEstadoCuentaSocio);
router.get('/movimientos-cuenta', reportesController.getMovimientosCuenta);

// 📅 Proyecciones
router.get('/proyeccion-pagos', reportesController.getProyeccionPagos);

module.exports = router;

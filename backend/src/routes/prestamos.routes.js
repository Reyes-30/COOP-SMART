/**
 * Rutas de Préstamos
 */

const express = require('express');
const router = express.Router();
const prestamosController = require('../controllers/prestamos.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener todos los préstamos
router.get('/', prestamosController.obtenerPrestamos);

// Obtener un préstamo por ID
router.get('/:id', prestamosController.obtenerPrestamoPorId);

// Crear una solicitud de préstamo (solo admin y cajero)
router.post('/', 
  verificarRol('administrador', 'cajero'),
  prestamosController.crearSolicitud
);

// Aprobar un préstamo (solo admin)
router.put('/:id/aprobar',
  verificarRol('administrador'),
  prestamosController.aprobarPrestamo
);

// Rechazar un préstamo (solo admin)
router.put('/:id/rechazar',
  verificarRol('administrador'),
  prestamosController.rechazarPrestamo
);

module.exports = router;

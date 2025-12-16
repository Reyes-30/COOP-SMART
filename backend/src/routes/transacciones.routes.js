/**
 * Rutas de Transacciones
 */

const express = require('express');
const router = express.Router();
const transaccionesController = require('../controllers/transacciones.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener todas las transacciones
router.get('/', transaccionesController.obtenerTransacciones);

// Crear una nueva transacción (solo admin y cajero)
router.post('/', 
  verificarRol('administrador', 'cajero'),
  transaccionesController.crearTransaccion
);

// Transferencia móvil (permitido para socios - solo transferencias entre sus cuentas)
router.post('/transferencia-movil', 
  verificarRol('administrador', 'cajero', 'socio'),
  transaccionesController.transferenciaSocio
);

module.exports = router;

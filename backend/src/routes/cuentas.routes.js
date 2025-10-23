/**
 * Rutas de Cuentas
 */

const express = require('express');
const router = express.Router();
const cuentasController = require('../controllers/cuentas.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener todas las cuentas
router.get('/', cuentasController.obtenerCuentas);

// Obtener una cuenta por ID
router.get('/:id', cuentasController.obtenerCuentaPorId);

// Crear una nueva cuenta (solo admin y cajero)
router.post('/',
  verificarRol('administrador', 'cajero'),
  cuentasController.crearCuenta
);

// Realizar depósito (solo admin y cajero)
router.post('/:id/depositar',
  verificarRol('administrador', 'cajero'),
  cuentasController.depositar
);

// Realizar retiro (solo admin y cajero)
router.post('/:id/retirar',
  verificarRol('administrador', 'cajero'),
  cuentasController.retirar
);

module.exports = router;

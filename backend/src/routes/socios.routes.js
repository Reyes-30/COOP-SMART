/**
 * Rutas de Socios
 */

const express = require('express');
const router = express.Router();
const sociosController = require('../controllers/socios.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener todos los socios
router.get('/', sociosController.obtenerSocios);

// Obtener un socio por ID
router.get('/:id', sociosController.obtenerSocioPorId);

// Crear un nuevo socio (solo admin y cajero)
router.post('/', 
  verificarRol('administrador', 'cajero'),
  sociosController.crearSocio
);

// Actualizar un socio (solo admin y cajero)
router.put('/:id',
  verificarRol('administrador', 'cajero'),
  sociosController.actualizarSocio
);

// Eliminar un socio (solo admin)
router.delete('/:id',
  verificarRol('administrador'),
  sociosController.eliminarSocio
);

module.exports = router;

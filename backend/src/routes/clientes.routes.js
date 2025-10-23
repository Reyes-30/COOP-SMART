/**
 * Rutas de Clientes (alias de socios tipo 'cliente')
 */

const express = require('express');
const router = express.Router();
const sociosController = require('../controllers/socios.controller');
const { verificarToken } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Reutilizar controlador de socios pero filtrar por tipo='cliente'
router.get('/', async (req, res, next) => {
  req.query.tipo = 'cliente';
  sociosController.obtenerSocios(req, res, next);
});

router.get('/:id', sociosController.obtenerSocioPorId);

module.exports = router;

/**
 * Rutas de Reportes (placeholder)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken);
router.use(verificarRol('administrador', 'cajero'));

router.get('/', (req, res) => {
  res.json({ 
    mensaje: 'Endpoint de reportes - En desarrollo',
    info: 'Este módulo será implementado próximamente',
    tipos_disponibles: [
      'ingresos',
      'egresos',
      'balance',
      'prestamos',
      'socios'
    ]
  });
});

module.exports = router;

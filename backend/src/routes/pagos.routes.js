/**
 * Rutas de Pagos (placeholder)
 */

const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');

router.use(verificarToken);

router.get('/', (req, res) => {
  res.json({ 
    mensaje: 'Endpoint de pagos - En desarrollo',
    info: 'Este módulo será implementado próximamente'
  });
});

module.exports = router;

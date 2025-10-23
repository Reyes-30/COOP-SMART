/**
 * Rutas de Logs/Bitácora
 */

const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/auth');
const Log = require('../models/Log');

// Solo administradores pueden ver logs
router.use(verificarToken);
router.use(verificarRol('administrador'));

/**
 * Obtener logs con filtros
 */
router.get('/', async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 50,
      usuario_id,
      modulo,
      accion,
      fecha_inicio,
      fecha_fin
    } = req.query;

    const skip = (pagina - 1) * limite;
    const query = {};

    if (usuario_id) query.usuario_id = parseInt(usuario_id);
    if (modulo) query.modulo = modulo;
    if (accion) query.accion = accion;
    
    if (fecha_inicio || fecha_fin) {
      query.createdAt = {};
      if (fecha_inicio) query.createdAt.$gte = new Date(fecha_inicio);
      if (fecha_fin) query.createdAt.$lte = new Date(fecha_fin);
    }

    const [logs, total] = await Promise.all([
      Log.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limite)),
      Log.countDocuments(query)
    ]);

    res.json({
      logs,
      paginacion: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(total / limite)
      }
    });

  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ error: 'Error al obtener logs' });
  }
});

module.exports = router;

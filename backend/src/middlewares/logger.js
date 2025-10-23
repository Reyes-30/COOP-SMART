/**
 * Middleware para registrar logs de auditoría
 */

const Log = require('../models/Log');

/**
 * Registra una acción en la bitácora
 */
const registrarLog = async (req, accion, descripcion, datosAdicionales = {}) => {
  try {
    const log = new Log({
      usuario_id: req.usuario?.id || 0,
      usuario_nombre: req.usuario?.nombre_usuario || 'Sistema',
      rol: req.usuario?.rol || 'sistema',
      accion,
      modulo: req.baseUrl?.split('/')[2] || 'general',
      descripcion,
      ip: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent'],
      ...datosAdicionales
    });

    await log.save();
  } catch (error) {
    // No lanzar error si falla el log, solo registrar en consola
    console.error('Error al guardar log:', error.message);
  }
};

/**
 * Middleware para auto-registrar acciones
 */
const autoLog = (accion, descripcionFn) => {
  return async (req, res, next) => {
    // Guardar el método send original
    const originalSend = res.send;

    // Sobrescribir el método send
    res.send = function (data) {
      // Si la respuesta es exitosa, registrar log
      if (res.statusCode < 400) {
        const descripcion = typeof descripcionFn === 'function' 
          ? descripcionFn(req) 
          : descripcionFn;
        
        registrarLog(req, accion, descripcion, {
          resultado: 'exito'
        });
      }

      // Llamar al send original
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  registrarLog,
  autoLog
};

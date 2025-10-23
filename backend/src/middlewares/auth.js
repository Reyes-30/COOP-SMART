/**
 * Middleware de autenticación JWT
 */

const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * Verifica el token JWT en las peticiones
 */
const verificarToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado. Token no proporcionado.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        error: 'Usuario no válido o inactivo'
      });
    }

    // Agregar usuario al request
    req.usuario = {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
      nombre_completo: usuario.nombre_completo
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(500).json({ error: 'Error en autenticación' });
  }
};

/**
 * Verifica que el usuario tenga uno de los roles permitidos
 */
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción',
        rol_requerido: rolesPermitidos,
        tu_rol: req.usuario.rol
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol
};

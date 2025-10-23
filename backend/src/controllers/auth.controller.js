/**
 * Controlador de Autenticación
 */

const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { registrarLog } = require('../middlewares/logger');

/**
 * Iniciar sesión
 */
const login = async (req, res) => {
  try {
    const { nombre_usuario, contrasena } = req.body;

    // Validar campos
    if (!nombre_usuario || !contrasena) {
      return res.status(400).json({
        error: 'Usuario y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({
      where: { nombre_usuario }
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(401).json({
        error: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const esValida = await usuario.compararContrasena(contrasena);
    
    if (!esValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    );

    // Registrar log
    await registrarLog(req, 'login', `Usuario ${nombre_usuario} inició sesión`, {
      resultado: 'exito',
      datos_nuevos: { usuario_id: usuario.id, rol: usuario.rol }
    });

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión'
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
const perfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: ['id', 'nombre_usuario', 'email', 'nombre_completo', 'rol', 'activo', 'createdAt']
    });

    res.json({ usuario });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error al obtener perfil'
    });
  }
};

/**
 * Cambiar contraseña
 */
const cambiarContrasena = async (req, res) => {
  try {
    const { contrasena_actual, contrasena_nueva } = req.body;

    if (!contrasena_actual || !contrasena_nueva) {
      return res.status(400).json({
        error: 'Contraseña actual y nueva son requeridas'
      });
    }

    if (contrasena_nueva.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const usuario = await Usuario.findByPk(req.usuario.id);

    // Verificar contraseña actual
    const esValida = await usuario.compararContrasena(contrasena_actual);
    
    if (!esValida) {
      return res.status(401).json({
        error: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    usuario.contrasena_hash = contrasena_nueva;
    await usuario.save();

    await registrarLog(req, 'cambiar_contrasena', 'Usuario cambió su contraseña');

    res.json({
      mensaje: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      error: 'Error al cambiar contraseña'
    });
  }
};

module.exports = {
  login,
  perfil,
  cambiarContrasena
};

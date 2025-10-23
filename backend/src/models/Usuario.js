/**
 * Modelo de Usuario
 * Tabla: usuarios
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');
const bcrypt = require('bcrypt');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_usuario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  contrasena_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('administrador', 'cajero', 'socio'),
    allowNull: false,
    defaultValue: 'socio'
  },
  nombre_completo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

// Método para encriptar contraseña antes de guardar
Usuario.beforeCreate(async (usuario) => {
  if (usuario.contrasena_hash) {
    const salt = await bcrypt.genSalt(10);
    usuario.contrasena_hash = await bcrypt.hash(usuario.contrasena_hash, salt);
  }
});

// Método para comparar contraseñas
Usuario.prototype.compararContrasena = async function(contrasena) {
  return await bcrypt.compare(contrasena, this.contrasena_hash);
};

module.exports = Usuario;

/**
 * Modelo de Socio
 * Tabla: socios
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const Socio = sequelize.define('Socio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  identidad: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Número de identidad hondureño'
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  genero: {
    type: DataTypes.ENUM('M', 'F', 'Otro'),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  celular: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ciudad: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  departamento: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('socio', 'cliente'),
    allowNull: false,
    defaultValue: 'socio',
    comment: 'Socio: miembro de la cooperativa, Cliente: solo usuario de servicios'
  },
  fecha_ingreso: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
    allowNull: false,
    defaultValue: 'activo'
  },
  ocupacion: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lugar_trabajo: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  ingresos_mensuales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  foto_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'socios',
  timestamps: true
});

module.exports = Socio;

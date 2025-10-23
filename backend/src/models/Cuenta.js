/**
 * Modelo de Cuenta de Ahorro
 * Tabla: cuentas
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const Cuenta = sequelize.define('Cuenta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_cuenta: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Número único de cuenta generado automáticamente'
  },
  id_socio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'socios',
      key: 'id'
    }
  },
  tipo_cuenta: {
    type: DataTypes.ENUM('ahorro', 'corriente', 'plazo_fijo'),
    allowNull: false,
    defaultValue: 'ahorro'
  },
  saldo: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  tasa_interes: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'Tasa de interés anual en porcentaje'
  },
  fecha_apertura: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Solo para cuentas de plazo fijo'
  },
  estado: {
    type: DataTypes.ENUM('activa', 'inactiva', 'bloqueada', 'cerrada'),
    allowNull: false,
    defaultValue: 'activa'
  },
  moneda: {
    type: DataTypes.ENUM('HNL', 'USD'),
    allowNull: false,
    defaultValue: 'HNL'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'cuentas',
  timestamps: true
});

module.exports = Cuenta;

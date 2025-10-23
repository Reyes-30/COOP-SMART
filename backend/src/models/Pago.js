/**
 * Modelo de Pago de Préstamo
 * Tabla: pagos
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_recibo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  id_prestamo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'prestamos',
      key: 'id'
    }
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  monto_capital: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  monto_interes: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  mora: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  tipo_pago: {
    type: DataTypes.ENUM('cuota_regular', 'pago_adelantado', 'pago_extra', 'pago_total'),
    allowNull: false,
    defaultValue: 'cuota_regular'
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'cheque', 'transferencia', 'tarjeta'),
    allowNull: false,
    defaultValue: 'efectivo'
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  recibido_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  referencia: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Número de cheque, transferencia, etc.'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pagos',
  timestamps: true
});

module.exports = Pago;

/**
 * Modelo de Transacción (Depósitos y Retiros)
 * Tabla: transacciones
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const Transaccion = sequelize.define('Transaccion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_transaccion: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  id_cuenta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cuentas',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('deposito', 'retiro', 'transferencia_entrada', 'transferencia_salida', 'interes', 'cargo', 'apertura', 'cierre'),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  saldo_anterior: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  saldo_nuevo: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  fecha_transaccion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  realizado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  referencia: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'transacciones',
  timestamps: true
});

module.exports = Transaccion;

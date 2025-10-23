/**
 * Modelo de Préstamo
 * Tabla: prestamos
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const Prestamo = sequelize.define('Prestamo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_prestamo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  id_socio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'socios',
      key: 'id'
    }
  },
  monto_solicitado: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  monto_aprobado: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  tasa_interes: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Tasa de interés anual en porcentaje'
  },
  plazo_meses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Plazo del préstamo en meses'
  },
  cuota_mensual: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  saldo_pendiente: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  tipo_prestamo: {
    type: DataTypes.ENUM('personal', 'vehicular', 'hipotecario', 'comercial', 'emergencia'),
    allowNull: false,
    defaultValue: 'personal'
  },
  proposito: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('solicitado', 'en_revision', 'aprobado', 'rechazado', 'desembolsado', 'activo', 'pagado', 'vencido', 'cancelado'),
    allowNull: false,
    defaultValue: 'solicitado'
  },
  fecha_solicitud: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_aprobacion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_desembolso: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_primer_pago: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_ultimo_pago: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  aprobado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  garantia: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción de la garantía'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'prestamos',
  timestamps: true
});

module.exports = Prestamo;

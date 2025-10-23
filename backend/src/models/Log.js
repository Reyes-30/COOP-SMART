/**
 * Modelo de Log/Bitácora (MongoDB)
 * Usado para auditoría y seguimiento de acciones
 */

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  usuario_id: {
    type: Number,
    required: true
  },
  usuario_nombre: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['administrador', 'cajero', 'socio'],
    required: true
  },
  accion: {
    type: String,
    required: true,
    // Ejemplos: 'login', 'logout', 'crear_socio', 'editar_cuenta', 'aprobar_prestamo', etc.
  },
  modulo: {
    type: String,
    required: true,
    enum: ['auth', 'socios', 'cuentas', 'prestamos', 'pagos', 'reportes', 'usuarios']
  },
  descripcion: {
    type: String,
    required: true
  },
  datos_anteriores: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  datos_nuevos: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ip: {
    type: String,
    required: true
  },
  user_agent: {
    type: String,
    default: null
  },
  resultado: {
    type: String,
    enum: ['exito', 'error', 'advertencia'],
    default: 'exito'
  },
  mensaje_error: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'logs'
});

// Índices para mejorar búsquedas
logSchema.index({ usuario_id: 1, createdAt: -1 });
logSchema.index({ modulo: 1, accion: 1 });
logSchema.index({ createdAt: -1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;

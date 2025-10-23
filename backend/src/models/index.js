/**
 * Archivo principal de modelos
 * Define las relaciones entre modelos
 */

const sequelize = require('../config/mysql');
const Usuario = require('./Usuario');
const Socio = require('./Socio');
const Cuenta = require('./Cuenta');
const Prestamo = require('./Prestamo');
const Pago = require('./Pago');
const Transaccion = require('./Transaccion');
const Log = require('./Log');

// Relaciones entre modelos

// Un Socio puede tener muchas Cuentas
Socio.hasMany(Cuenta, {
  foreignKey: 'id_socio',
  as: 'cuentas'
});
Cuenta.belongsTo(Socio, {
  foreignKey: 'id_socio',
  as: 'socio'
});

// Un Socio puede tener muchos Préstamos
Socio.hasMany(Prestamo, {
  foreignKey: 'id_socio',
  as: 'prestamos'
});
Prestamo.belongsTo(Socio, {
  foreignKey: 'id_socio',
  as: 'socio'
});

// Un Préstamo puede tener muchos Pagos
Prestamo.hasMany(Pago, {
  foreignKey: 'id_prestamo',
  as: 'pagos'
});
Pago.belongsTo(Prestamo, {
  foreignKey: 'id_prestamo',
  as: 'prestamo'
});

// Una Cuenta puede tener muchas Transacciones
Cuenta.hasMany(Transaccion, {
  foreignKey: 'id_cuenta',
  as: 'transacciones'
});
Transaccion.belongsTo(Cuenta, {
  foreignKey: 'id_cuenta',
  as: 'cuenta'
});

// Usuario que aprueba préstamos
Prestamo.belongsTo(Usuario, {
  foreignKey: 'aprobado_por',
  as: 'aprobador'
});

// Usuario que recibe pagos
Pago.belongsTo(Usuario, {
  foreignKey: 'recibido_por',
  as: 'cajero'
});

// Usuario que realiza transacciones
Transaccion.belongsTo(Usuario, {
  foreignKey: 'realizado_por',
  as: 'cajero'
});

// Función para sincronizar modelos con la base de datos
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
  }
};

module.exports = {
  sequelize,
  Usuario,
  Socio,
  Cuenta,
  Prestamo,
  Pago,
  Transaccion,
  Log,
  syncDatabase
};

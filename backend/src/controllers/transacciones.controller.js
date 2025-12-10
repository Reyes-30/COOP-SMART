/**
 * Controlador de Transacciones
 */

const { Cuenta, Transaccion } = require('../models');

/**
 * Generar número de transacción único
 */
const generarNumeroTransaccion = (pref = 'TXN') => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${pref}${timestamp}${random}`;
};

/**
 * Obtener transacciones, opcionalmente filtradas por cuenta
 */
const obtenerTransacciones = async (req, res) => {
  try {
    const { id_cuenta } = req.query;
    const where = {};
    if (id_cuenta) where.id_cuenta = id_cuenta;

    const transacciones = await Transaccion.findAll({
      where,
      order: [['fecha_transaccion', 'DESC']],
      limit: 100
    });

    res.json(transacciones);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
};

/**
 * Crear una transacción y actualizar el saldo de la cuenta
 */
const crearTransaccion = async (req, res) => {
  try {
    const { id_cuenta, tipo, monto, descripcion } = req.body;

    if (!id_cuenta || !tipo || !monto || monto <= 0) {
      return res.status(400).json({ error: 'Datos de transacción inválidos' });
    }

    if (!['deposito', 'retiro'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de transacción no soportado' });
    }

    const cuenta = await Cuenta.findByPk(id_cuenta);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    if (cuenta.estado !== 'activa') {
      return res.status(400).json({ error: 'La cuenta no está activa' });
    }

    const saldo_anterior = parseFloat(cuenta.saldo);
    let saldo_nuevo = saldo_anterior;

    if (tipo === 'deposito') {
      saldo_nuevo = saldo_anterior + parseFloat(monto);
    } else if (tipo === 'retiro') {
      if (saldo_anterior < parseFloat(monto)) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
      }
      saldo_nuevo = saldo_anterior - parseFloat(monto);
    }

    // Actualizar saldo de la cuenta
    await cuenta.update({ saldo: saldo_nuevo });

    // Registrar transacción
    const numero_transaccion = generarNumeroTransaccion(tipo === 'deposito' ? 'DEP' : 'RET');
    const transaccion = await Transaccion.create({
      numero_transaccion,
      id_cuenta: cuenta.id,
      tipo,
      monto,
      saldo_anterior,
      saldo_nuevo,
      realizado_por: req.usuario.id,
      descripcion: descripcion || (tipo === 'deposito' ? 'Depósito en cuenta' : 'Retiro en cuenta')
    });

    res.status(201).json({
      mensaje: 'Transacción registrada exitosamente',
      transaccion,
      saldo_nuevo
    });
  } catch (error) {
    console.error('Error al crear transacción:', error);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
};

module.exports = {
  obtenerTransacciones,
  crearTransaccion
};

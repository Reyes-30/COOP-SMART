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
    const { id_cuenta, tipo, monto, descripcion, id_cuenta_destino } = req.body;

    if (!id_cuenta || !tipo || !monto || monto <= 0) {
      return res.status(400).json({ error: 'Datos de transacción inválidos' });
    }

    if (!['deposito', 'retiro', 'transferencia_salida', 'transferencia'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de transacción no soportado' });
    }

    const cuenta = await Cuenta.findByPk(id_cuenta);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta origen no encontrada' });
    }

    if (cuenta.estado !== 'activa') {
      return res.status(400).json({ error: 'La cuenta origen no está activa' });
    }

    const saldo_anterior = parseFloat(cuenta.saldo);
    let saldo_nuevo = saldo_anterior;

    // Manejar transferencias
    if (tipo === 'transferencia' || tipo === 'transferencia_salida') {
      if (!id_cuenta_destino) {
        return res.status(400).json({ error: 'Se requiere cuenta destino para transferencia' });
      }

      if (id_cuenta === id_cuenta_destino) {
        return res.status(400).json({ error: 'No puede transferir a la misma cuenta' });
      }

      const cuentaDestino = await Cuenta.findByPk(id_cuenta_destino);
      if (!cuentaDestino) {
        return res.status(404).json({ error: 'Cuenta destino no encontrada' });
      }

      if (cuentaDestino.estado !== 'activa') {
        return res.status(400).json({ error: 'La cuenta destino no está activa' });
      }

      if (saldo_anterior < parseFloat(monto)) {
        return res.status(400).json({ error: 'Saldo insuficiente para la transferencia' });
      }

      // Actualizar cuenta origen (resta)
      saldo_nuevo = saldo_anterior - parseFloat(monto);
      await cuenta.update({ saldo: saldo_nuevo });

      // Actualizar cuenta destino (suma)
      const saldo_anterior_destino = parseFloat(cuentaDestino.saldo);
      const saldo_nuevo_destino = saldo_anterior_destino + parseFloat(monto);
      await cuentaDestino.update({ saldo: saldo_nuevo_destino });

      // Registrar transacción de salida
      const numero_transaccion_salida = generarNumeroTransaccion('TRO');
      const transaccionSalida = await Transaccion.create({
        numero_transaccion: numero_transaccion_salida,
        id_cuenta: cuenta.id,
        tipo: 'transferencia_salida',
        monto,
        saldo_anterior,
        saldo_nuevo,
        realizado_por: req.usuario.id,
        descripcion: descripcion || `Transferencia a cuenta ${cuentaDestino.numero_cuenta}`,
        referencia: `Destino: ${cuentaDestino.numero_cuenta}`
      });

      // Registrar transacción de entrada
      const numero_transaccion_entrada = generarNumeroTransaccion('TRI');
      await Transaccion.create({
        numero_transaccion: numero_transaccion_entrada,
        id_cuenta: cuentaDestino.id,
        tipo: 'transferencia_entrada',
        monto,
        saldo_anterior: saldo_anterior_destino,
        saldo_nuevo: saldo_nuevo_destino,
        realizado_por: req.usuario.id,
        descripcion: descripcion || `Transferencia desde cuenta ${cuenta.numero_cuenta}`,
        referencia: `Origen: ${cuenta.numero_cuenta}`
      });

      return res.status(201).json({
        mensaje: 'Transferencia realizada exitosamente',
        transaccion: transaccionSalida,
        saldo_nuevo,
        saldo_nuevo_destino
      });
    }

    // Depósitos y retiros normales
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

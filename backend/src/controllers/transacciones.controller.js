/**
 * Controlador de Transacciones
 */

const { Cuenta, Transaccion, Socio, Usuario } = require('../models');
const { Op } = require('sequelize');

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
 * Si es socio, solo muestra transacciones de sus cuentas
 */
const obtenerTransacciones = async (req, res) => {
  try {
    const { id_cuenta, tipo, limit = 100 } = req.query;
    let where = {};
    
    // Si es un socio, solo puede ver transacciones de sus propias cuentas
    if (req.usuario.rol === 'socio') {
      const usuario = await Usuario.findByPk(req.usuario.id);
      if (usuario && usuario.email) {
        const socio = await Socio.findOne({ where: { email: usuario.email } });
        if (socio) {
          // Obtener todas las cuentas del socio
          const cuentas = await Cuenta.findAll({ 
            where: { id_socio: socio.id },
            attributes: ['id']
          });
          const cuentaIds = cuentas.map(c => c.id);
          where.id_cuenta = { [Op.in]: cuentaIds };
        } else {
          return res.json([]);
        }
      }
    } else if (id_cuenta) {
      where.id_cuenta = id_cuenta;
    }
    
    // Filtrar por tipo si se especifica
    if (tipo && tipo !== 'todos') {
      if (tipo === 'deposito') {
        where.tipo = { [Op.in]: ['deposito', 'transferencia_entrada'] };
      } else if (tipo === 'retiro') {
        where.tipo = { [Op.in]: ['retiro', 'transferencia_salida'] };
      } else if (tipo === 'transferencia') {
        where.tipo = { [Op.in]: ['transferencia_entrada', 'transferencia_salida'] };
      }
    }

    const transacciones = await Transaccion.findAll({
      where,
      order: [['fecha_transaccion', 'DESC']],
      limit: parseInt(limit)
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

/**
 * Transferencia para socios desde app móvil
 * Los socios solo pueden transferir desde sus propias cuentas
 */
const transferenciaSocio = async (req, res) => {
  try {
    const { cuenta_origen_id, cuenta_destino_id, monto, descripcion } = req.body;

    // Validaciones básicas
    if (!cuenta_origen_id || !cuenta_destino_id || !monto || monto <= 0) {
      return res.status(400).json({ error: 'Datos de transferencia inválidos' });
    }

    // Obtener cuenta origen
    const cuentaOrigen = await Cuenta.findByPk(cuenta_origen_id, {
      include: [{ model: Socio, as: 'socio' }]
    });

    if (!cuentaOrigen) {
      return res.status(404).json({ error: 'Cuenta origen no encontrada' });
    }

    // Verificar que la cuenta origen pertenece al usuario (si es socio)
    if (req.usuario.rol === 'socio') {
      // Buscar socio por email del usuario
      const socio = await Socio.findOne({
        where: { email: req.usuario.email }
      });

      if (!socio || cuentaOrigen.id_socio !== socio.id) {
        return res.status(403).json({ error: 'No tienes permiso para transferir desde esta cuenta' });
      }
    }

    if (cuentaOrigen.estado !== 'activa') {
      return res.status(400).json({ error: 'La cuenta origen no está activa' });
    }

    // Buscar cuenta destino por número de cuenta
    let cuentaDestino;
    if (isNaN(cuenta_destino_id)) {
      // Es un número de cuenta
      cuentaDestino = await Cuenta.findOne({
        where: { numero_cuenta: cuenta_destino_id }
      });
    } else {
      cuentaDestino = await Cuenta.findByPk(cuenta_destino_id);
    }

    if (!cuentaDestino) {
      return res.status(404).json({ error: 'Cuenta destino no encontrada' });
    }

    if (cuentaDestino.estado !== 'activa') {
      return res.status(400).json({ error: 'La cuenta destino no está activa' });
    }

    if (cuentaOrigen.id === cuentaDestino.id) {
      return res.status(400).json({ error: 'No puede transferir a la misma cuenta' });
    }

    const montoTransfer = parseFloat(monto);
    const saldoOrigen = parseFloat(cuentaOrigen.saldo);

    if (saldoOrigen < montoTransfer) {
      return res.status(400).json({ error: 'Saldo insuficiente para la transferencia' });
    }

    // Realizar la transferencia
    const saldoNuevoOrigen = saldoOrigen - montoTransfer;
    const saldoAnteriorDestino = parseFloat(cuentaDestino.saldo);
    const saldoNuevoDestino = saldoAnteriorDestino + montoTransfer;

    // Actualizar saldos
    await cuentaOrigen.update({ saldo: saldoNuevoOrigen });
    await cuentaDestino.update({ saldo: saldoNuevoDestino });

    // Registrar transacción de salida
    const numTransSalida = generarNumeroTransaccion('TRM');
    await Transaccion.create({
      numero_transaccion: numTransSalida,
      id_cuenta: cuentaOrigen.id,
      tipo: 'transferencia_salida',
      monto: montoTransfer,
      saldo_anterior: saldoOrigen,
      saldo_nuevo: saldoNuevoOrigen,
      realizado_por: req.usuario.id,
      descripcion: descripcion || `Transferencia móvil a ${cuentaDestino.numero_cuenta}`,
      referencia: `Destino: ${cuentaDestino.numero_cuenta}`
    });

    // Registrar transacción de entrada
    const numTransEntrada = generarNumeroTransaccion('TRM');
    await Transaccion.create({
      numero_transaccion: numTransEntrada,
      id_cuenta: cuentaDestino.id,
      tipo: 'transferencia_entrada',
      monto: montoTransfer,
      saldo_anterior: saldoAnteriorDestino,
      saldo_nuevo: saldoNuevoDestino,
      realizado_por: req.usuario.id,
      descripcion: descripcion || `Transferencia móvil desde ${cuentaOrigen.numero_cuenta}`,
      referencia: `Origen: ${cuentaOrigen.numero_cuenta}`
    });

    res.status(201).json({
      mensaje: 'Transferencia realizada exitosamente',
      saldo_nuevo: saldoNuevoOrigen
    });

  } catch (error) {
    console.error('Error en transferencia móvil:', error);
    res.status(500).json({ error: 'Error al realizar la transferencia' });
  }
};

module.exports = {
  obtenerTransacciones,
  crearTransaccion,
  transferenciaSocio
};

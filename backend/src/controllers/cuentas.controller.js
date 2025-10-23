/**
 * Controlador de Cuentas
 */

const { Cuenta, Socio, Transaccion } = require('../models');

/**
 * Generar número de cuenta único
 */
const generarNumeroCuenta = async () => {
  const prefix = 'CA';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

/**
 * Obtener todas las cuentas
 */
const obtenerCuentas = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, id_socio, estado } = req.query;
    const offset = (pagina - 1) * limite;

    const where = {};
    if (id_socio) where.id_socio = id_socio;
    if (estado) where.estado = estado;

    const { count, rows } = await Cuenta.findAndCountAll({
      where,
      include: [{
        model: Socio,
        as: 'socio',
        attributes: ['id', 'nombre', 'apellido', 'identidad']
      }],
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      cuentas: rows,
      paginacion: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(count / limite)
      }
    });

  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    res.status(500).json({ error: 'Error al obtener cuentas' });
  }
};

/**
 * Obtener una cuenta por ID
 */
const obtenerCuentaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cuenta = await Cuenta.findByPk(id, {
      include: [
        {
          model: Socio,
          as: 'socio',
          attributes: ['id', 'nombre', 'apellido', 'identidad', 'telefono']
        },
        {
          model: Transaccion,
          as: 'transacciones',
          limit: 10,
          order: [['fecha_transaccion', 'DESC']]
        }
      ]
    });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    res.json({ cuenta });

  } catch (error) {
    console.error('Error al obtener cuenta:', error);
    res.status(500).json({ error: 'Error al obtener cuenta' });
  }
};

/**
 * Crear una nueva cuenta
 */
const crearCuenta = async (req, res) => {
  try {
    const {
      id_socio,
      tipo_cuenta,
      monto_inicial = 0,
      tasa_interes,
      fecha_vencimiento,
      moneda
    } = req.body;

    // Validar socio existe
    const socio = await Socio.findByPk(id_socio);
    if (!socio) {
      return res.status(404).json({ error: 'Socio no encontrado' });
    }

    // Generar número de cuenta
    const numero_cuenta = await generarNumeroCuenta();

    // Crear cuenta
    const nuevaCuenta = await Cuenta.create({
      numero_cuenta,
      id_socio,
      tipo_cuenta: tipo_cuenta || 'ahorro',
      saldo: monto_inicial,
      tasa_interes: tasa_interes || 0,
      fecha_vencimiento,
      moneda: moneda || 'HNL'
    });

    // Registrar transacción de apertura si hay monto inicial
    if (monto_inicial > 0) {
      await Transaccion.create({
        numero_transaccion: `TXN${Date.now()}`,
        id_cuenta: nuevaCuenta.id,
        tipo: 'apertura',
        monto: monto_inicial,
        saldo_anterior: 0,
        saldo_nuevo: monto_inicial,
        realizado_por: req.usuario.id,
        descripcion: 'Depósito inicial de apertura de cuenta'
      });
    }

    res.status(201).json({
      mensaje: 'Cuenta creada exitosamente',
      cuenta: nuevaCuenta
    });

  } catch (error) {
    console.error('Error al crear cuenta:', error);
    res.status(500).json({ error: 'Error al crear cuenta' });
  }
};

/**
 * Realizar un depósito
 */
const depositar = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, descripcion } = req.body;

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const cuenta = await Cuenta.findByPk(id);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    if (cuenta.estado !== 'activa') {
      return res.status(400).json({ error: 'La cuenta no está activa' });
    }

    const saldo_anterior = parseFloat(cuenta.saldo);
    const saldo_nuevo = saldo_anterior + parseFloat(monto);

    // Actualizar saldo
    await cuenta.update({ saldo: saldo_nuevo });

    // Registrar transacción
    const transaccion = await Transaccion.create({
      numero_transaccion: `DEP${Date.now()}`,
      id_cuenta: cuenta.id,
      tipo: 'deposito',
      monto,
      saldo_anterior,
      saldo_nuevo,
      realizado_por: req.usuario.id,
      descripcion: descripcion || 'Depósito en efectivo'
    });

    res.json({
      mensaje: 'Depósito realizado exitosamente',
      transaccion,
      saldo_nuevo
    });

  } catch (error) {
    console.error('Error al depositar:', error);
    res.status(500).json({ error: 'Error al realizar depósito' });
  }
};

/**
 * Realizar un retiro
 */
const retirar = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, descripcion } = req.body;

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const cuenta = await Cuenta.findByPk(id);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    if (cuenta.estado !== 'activa') {
      return res.status(400).json({ error: 'La cuenta no está activa' });
    }

    const saldo_anterior = parseFloat(cuenta.saldo);
    
    if (saldo_anterior < parseFloat(monto)) {
      return res.status(400).json({ 
        error: 'Saldo insuficiente',
        saldo_disponible: saldo_anterior
      });
    }

    const saldo_nuevo = saldo_anterior - parseFloat(monto);

    // Actualizar saldo
    await cuenta.update({ saldo: saldo_nuevo });

    // Registrar transacción
    const transaccion = await Transaccion.create({
      numero_transaccion: `RET${Date.now()}`,
      id_cuenta: cuenta.id,
      tipo: 'retiro',
      monto,
      saldo_anterior,
      saldo_nuevo,
      realizado_por: req.usuario.id,
      descripcion: descripcion || 'Retiro en efectivo'
    });

    res.json({
      mensaje: 'Retiro realizado exitosamente',
      transaccion,
      saldo_nuevo
    });

  } catch (error) {
    console.error('Error al retirar:', error);
    res.status(500).json({ error: 'Error al realizar retiro' });
  }
};

module.exports = {
  obtenerCuentas,
  obtenerCuentaPorId,
  crearCuenta,
  depositar,
  retirar
};

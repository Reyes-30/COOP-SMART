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

    console.log('📝 Creando cuenta:', {
      id_socio,
      tipo_cuenta,
      monto_inicial,
      usuario: req.usuario?.id
    });

    // Validar socio existe
    const socio = await Socio.findByPk(id_socio);
    if (!socio) {
      return res.status(404).json({ error: 'Socio no encontrado' });
    }

    // Validar monto inicial
    const montoInicialNum = parseFloat(monto_inicial) || 0;
    if (montoInicialNum < 0) {
      return res.status(400).json({ error: 'El monto inicial no puede ser negativo' });
    }

    // Generar número de cuenta
    const numero_cuenta = await generarNumeroCuenta();

    // Crear cuenta con el saldo inicial
    const nuevaCuenta = await Cuenta.create({
      numero_cuenta,
      id_socio,
      tipo_cuenta: tipo_cuenta || 'ahorro',
      saldo: montoInicialNum,
      tasa_interes: parseFloat(tasa_interes) || 0,
      fecha_vencimiento,
      moneda: moneda || 'HNL',
      estado: 'activa'
    });

    console.log(`✅ Cuenta creada: ${numero_cuenta} con saldo: L. ${montoInicialNum}`);

    // Registrar transacción de apertura si hay monto inicial
    if (montoInicialNum > 0) {
      try {
        const numeroTransaccion = `APR${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        const transaccion = await Transaccion.create({
          numero_transaccion: numeroTransaccion,
          id_cuenta: nuevaCuenta.id,
          tipo: 'apertura',
          monto: montoInicialNum,
          saldo_anterior: 0,
          saldo_nuevo: montoInicialNum,
          realizado_por: req.usuario.id,
          descripcion: `Depósito inicial de apertura - Cuenta ${numero_cuenta}`,
          referencia: `Apertura cuenta ${tipo_cuenta || 'ahorro'}`
        });
        
        console.log(`✅ Transacción de apertura creada: ${numeroTransaccion} - Monto: L. ${montoInicialNum}`);
      } catch (transError) {
        console.error('⚠️ Error al crear transacción de apertura:', transError.message);
        // No fallar la creación de cuenta si falla la transacción
        // La cuenta ya tiene el saldo correcto
      }
    }

    res.status(201).json({
      mensaje: 'Cuenta creada exitosamente',
      cuenta: nuevaCuenta
    });

  } catch (error) {
    console.error('❌ Error al crear cuenta:', error);
    res.status(500).json({ 
      error: 'Error al crear cuenta', 
      detalle: error.message 
    });
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
  retirar,
  /**
   * Actualizar campos de la cuenta (estado, tasa_interes, tipo_cuenta)
   */
  actualizarCuenta: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, tasa_interes, tipo_cuenta, saldo } = req.body;

      const cuenta = await Cuenta.findByPk(id);
      if (!cuenta) {
        return res.status(404).json({ error: 'Cuenta no encontrada' });
      }

      const updates = {};
      if (estado) updates.estado = estado;
      if (tasa_interes !== undefined) updates.tasa_interes = parseFloat(tasa_interes);
      if (tipo_cuenta) updates.tipo_cuenta = tipo_cuenta;

      // No permitir actualización directa de saldo, usar transacciones
      if (saldo !== undefined) {
        console.warn('Intento de actualización directa de saldo bloqueado');
      }

      await cuenta.update(updates);

      res.json({ mensaje: 'Cuenta actualizada exitosamente', cuenta });
    } catch (error) {
      console.error('Error al actualizar cuenta:', error);
      res.status(500).json({ error: 'Error al actualizar cuenta' });
    }
  }
};

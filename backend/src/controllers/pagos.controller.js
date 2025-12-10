/**
 * Controlador de Pagos
 */

const { Pago, Prestamo } = require('../models');

const generarNumeroRecibo = () => {
  const pref = 'REC';
  const ts = Date.now().toString().slice(-8);
  const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${pref}${ts}${rnd}`;
};

const calcularCuotaMensual = (monto, tasaAnual, plazoMeses) => {
  const m = parseFloat(monto);
  const tAnual = parseFloat(tasaAnual);
  const n = parseInt(plazoMeses);
  if (!tAnual || tAnual === 0) return m / n;
  const tasaMensual = tAnual / 100 / 12;
  return m * (tasaMensual * Math.pow(1 + tasaMensual, n)) / (Math.pow(1 + tasaMensual, n) - 1);
};

/**
 * Obtener pagos, opcionalmente filtrados por préstamo
 */
const obtenerPagos = async (req, res) => {
  try {
    const { id_prestamo } = req.query;
    const where = {};
    if (id_prestamo) where.id_prestamo = id_prestamo;

    const pagos = await Pago.findAll({ where, order: [['fecha_pago', 'DESC']], limit: 500 });
    // Normalizar algunos campos para el frontend
    const adaptados = pagos.map(p => ({
      id: p.id,
      numero_recibo: p.numero_recibo,
      id_prestamo: p.id_prestamo,
      numero_cuota: p.numero_cuota,
      monto: parseFloat(p.monto),
      monto_capital: parseFloat(p.monto_capital || 0),
      monto_interes: parseFloat(p.monto_interes || 0),
      metodo_pago: p.metodo_pago,
      fecha_pago: p.fecha_pago,
      referencia: p.referencia,
      notas: p.notas
    }));
    res.json(adaptados);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

/**
 * Registrar pago de préstamo
 */
const registrarPago = async (req, res) => {
  try {
    const { id_prestamo, monto, metodo_pago, referencia, notas } = req.body;
    if (!id_prestamo || !monto || monto <= 0 || !metodo_pago) {
      return res.status(400).json({ error: 'Datos inválidos para pago' });
    }

    const prestamo = await Prestamo.findByPk(id_prestamo);
    if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado' });

    // Calcular número de cuota (pagos existentes + 1)
    const pagosExistentes = await Pago.count({ where: { id_prestamo } });
    const numero_cuota = pagosExistentes + 1;

    // Calcular distribución capital/interés basada en cuota_mensual
    const cuotaMensual = parseFloat(prestamo.cuota_mensual || calcularCuotaMensual(prestamo.monto_aprobado || prestamo.monto_solicitado, prestamo.tasa_interes, prestamo.plazo_meses));
    // Para simplicidad: proporcional si el monto es distinto
    let monto_interes_estimado = 0;
    let monto_capital_estimado = 0;
    if (cuotaMensual > 0) {
      // Aproximar interés como tasa mensual sobre saldo restante estimado
      const tasaMensual = parseFloat(prestamo.tasa_interes) / 100 / 12;
      // Saldo estimado (sin conocer amortización completa, aproximamos)
      // Esta aproximación es suficiente para UI sin afectar contabilidad real
      monto_interes_estimado = cuotaMensual * (tasaMensual > 0 ? 0.3 : 0); // heurística simple
      monto_capital_estimado = cuotaMensual - monto_interes_estimado;
      const proporcion = parseFloat(monto) / cuotaMensual;
      monto_interes_estimado = Math.max(0, monto_interes_estimado * proporcion);
      monto_capital_estimado = Math.max(0, monto_capital_estimado * proporcion);
    } else {
      monto_capital_estimado = parseFloat(monto);
      monto_interes_estimado = 0;
    }

    const numero_recibo = generarNumeroRecibo();
    const pago = await Pago.create({
      numero_recibo,
      id_prestamo,
      numero_cuota,
      monto,
      monto_capital: monto_capital_estimado,
      monto_interes: monto_interes_estimado,
      tipo_pago: 'cuota_regular',
      metodo_pago,
      fecha_pago: new Date(),
      recibido_por: req.usuario.id,
      referencia: referencia || null,
      notas: notas || null
    });

    // Actualizar estado a pagado si completó todas las cuotas
    if (numero_cuota >= parseInt(prestamo.plazo_meses || 0)) {
      await prestamo.update({ estado: 'pagado', fecha_ultimo_pago: new Date() });
    } else {
      await prestamo.update({ fecha_ultimo_pago: new Date() });
    }

    res.status(201).json({ mensaje: 'Pago registrado exitosamente', pago });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
};

module.exports = {
  obtenerPagos,
  registrarPago
};

/**
 * Controlador de Préstamos
 */

const { Prestamo, Socio, Cuenta } = require('../models');

const generarNumeroPrestamo = () => {
  const pref = 'PR';
  const timestamp = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${pref}${timestamp}${rand}`;
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
 * Mapear estado interno a esperado por frontend
 */
const mapEstadoOut = (estado) => {
  switch (estado) {
    case 'solicitado':
    case 'en_revision':
      return 'pendiente';
    case 'aprobado':
      return 'aprobado';
    case 'rechazado':
      return 'rechazado';
    case 'pagado':
      return 'pagado';
    default:
      return estado;
  }
};

/**
 * Obtener todos los préstamos
 */
const obtenerPrestamos = async (req, res) => {
  try {
    const prestamos = await Prestamo.findAll({ order: [['createdAt', 'DESC']] });
    // Adaptar forma al frontend
    const adaptados = prestamos.map(p => ({
      id: p.id,
      numero_prestamo: p.numero_prestamo,
      id_socio: p.id_socio,
      // El frontend espera 'monto'
      monto: parseFloat(p.monto_aprobado || p.monto_solicitado || 0),
      tasa_interes: parseFloat(p.tasa_interes || 0),
      plazo_meses: parseInt(p.plazo_meses || 0),
      cuota_mensual: parseFloat(p.cuota_mensual || calcularCuotaMensual(p.monto_aprobado || p.monto_solicitado, p.tasa_interes, p.plazo_meses)),
      proposito: p.tipo_prestamo || 'personal',
      descripcion: p.proposito || null,
      estado: mapEstadoOut(p.estado),
      fecha_solicitud: p.fecha_solicitud,
      fecha_aprobacion: p.fecha_aprobacion,
      id_cuenta: p.id_cuenta || null
    }));
    res.json(adaptados);
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    res.status(500).json({ error: 'Error al obtener préstamos' });
  }
};

/**
 * Obtener un préstamo por ID
 */
const obtenerPrestamoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await Prestamo.findByPk(id);
    if (!p) return res.status(404).json({ error: 'Préstamo no encontrado' });
    const prestamo = {
      id: p.id,
      numero_prestamo: p.numero_prestamo,
      id_socio: p.id_socio,
      monto: parseFloat(p.monto_aprobado || p.monto_solicitado || 0),
      tasa_interes: parseFloat(p.tasa_interes || 0),
      plazo_meses: parseInt(p.plazo_meses || 0),
      cuota_mensual: parseFloat(p.cuota_mensual || calcularCuotaMensual(p.monto_aprobado || p.monto_solicitado, p.tasa_interes, p.plazo_meses)),
      proposito: p.tipo_prestamo || 'personal',
      descripcion: p.proposito || null,
      estado: mapEstadoOut(p.estado),
      fecha_solicitud: p.fecha_solicitud,
      fecha_aprobacion: p.fecha_aprobacion,
      id_cuenta: p.id_cuenta || null
    };
    res.json(prestamo);
  } catch (error) {
    console.error('Error al obtener préstamo:', error);
    res.status(500).json({ error: 'Error al obtener préstamo' });
  }
};

/**
 * Crear solicitud de préstamo
 */
const crearSolicitud = async (req, res) => {
  try {
    const { id_socio, id_cuenta, monto, tasa_interes, plazo_meses, proposito, descripcion } = req.body;

    if (!id_socio || !id_cuenta || !monto || !tasa_interes || !plazo_meses) {
      return res.status(400).json({ error: 'Datos incompletos para solicitud' });
    }

    // Validar socio y cuenta
    const socio = await Socio.findByPk(id_socio);
    if (!socio) return res.status(404).json({ error: 'Socio no encontrado' });
    const cuenta = await Cuenta.findByPk(id_cuenta);
    if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });

    const numero_prestamo = generarNumeroPrestamo();
    const cuota_mensual = calcularCuotaMensual(monto, tasa_interes, plazo_meses);

    const nuevo = await Prestamo.create({
      numero_prestamo,
      id_socio,
      monto_solicitado: monto,
      tasa_interes,
      plazo_meses,
      cuota_mensual,
      tipo_prestamo: proposito || 'personal',
      proposito: descripcion || null,
      estado: 'solicitado',
      fecha_solicitud: new Date(),
      id_cuenta
    });

    res.status(201).json({
      mensaje: 'Solicitud de préstamo creada exitosamente',
      prestamo: nuevo
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error al crear solicitud de préstamo' });
  }
};

/**
 * Aprobar préstamo
 */
const aprobarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto_aprobado } = req.body;
    const p = await Prestamo.findByPk(id);
    if (!p) return res.status(404).json({ error: 'Préstamo no encontrado' });

    const monto = parseFloat(monto_aprobado || p.monto_solicitado || 0);
    const cuota_mensual = calcularCuotaMensual(monto, p.tasa_interes, p.plazo_meses);

    await p.update({
      estado: 'aprobado',
      monto_aprobado: monto,
      cuota_mensual,
      fecha_aprobacion: new Date(),
      aprobado_por: req.usuario.id
    });

    res.json({ mensaje: 'Préstamo aprobado exitosamente', prestamo: p });
  } catch (error) {
    console.error('Error al aprobar préstamo:', error);
    res.status(500).json({ error: 'Error al aprobar préstamo' });
  }
};

/**
 * Rechazar préstamo
 */
const rechazarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await Prestamo.findByPk(id);
    if (!p) return res.status(404).json({ error: 'Préstamo no encontrado' });

    await p.update({ estado: 'rechazado' });
    res.json({ mensaje: 'Préstamo rechazado exitosamente', prestamo: p });
  } catch (error) {
    console.error('Error al rechazar préstamo:', error);
    res.status(500).json({ error: 'Error al rechazar préstamo' });
  }
};

module.exports = {
  obtenerPrestamos,
  obtenerPrestamoPorId,
  crearSolicitud,
  aprobarPrestamo,
  rechazarPrestamo
};

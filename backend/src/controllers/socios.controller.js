/**
 * Controlador de Socios
 */

const { Socio, Cuenta, Prestamo } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los socios con paginación y búsqueda
 */
const obtenerSocios = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      limite = 10, 
      busqueda = '', 
      tipo = '',
      estado = ''
    } = req.query;

    const offset = (pagina - 1) * limite;

    // Construir filtros
    const where = {};
    
    if (busqueda) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { apellido: { [Op.like]: `%${busqueda}%` } },
        { identidad: { [Op.like]: `%${busqueda}%` } }
      ];
    }

    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;

    const { count, rows } = await Socio.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      socios: rows,
      paginacion: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(count / limite)
      }
    });

  } catch (error) {
    console.error('Error al obtener socios:', error);
    res.status(500).json({
      error: 'Error al obtener socios'
    });
  }
};

/**
 * Obtener un socio por ID con sus cuentas y préstamos
 */
const obtenerSocioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const socio = await Socio.findByPk(id, {
      include: [
        {
          model: Cuenta,
          as: 'cuentas',
          attributes: ['id', 'numero_cuenta', 'tipo_cuenta', 'saldo', 'estado', 'fecha_apertura']
        },
        {
          model: Prestamo,
          as: 'prestamos',
          attributes: ['id', 'numero_prestamo', 'monto_aprobado', 'saldo_pendiente', 'estado', 'fecha_solicitud']
        }
      ]
    });

    if (!socio) {
      return res.status(404).json({
        error: 'Socio no encontrado'
      });
    }

    res.json({ socio });

  } catch (error) {
    console.error('Error al obtener socio:', error);
    res.status(500).json({
      error: 'Error al obtener socio'
    });
  }
};

/**
 * Crear un nuevo socio
 */
const crearSocio = async (req, res) => {
  try {
    const {
      identidad,
      nombre,
      apellido,
      fecha_nacimiento,
      genero,
      telefono,
      celular,
      email,
      direccion,
      ciudad,
      departamento,
      tipo,
      ocupacion,
      lugar_trabajo,
      ingresos_mensuales
    } = req.body;

    // Validar campos requeridos
    if (!identidad || !nombre || !apellido || !fecha_nacimiento || !genero || !telefono || !direccion || !ciudad || !departamento) {
      return res.status(400).json({
        error: 'Todos los campos obligatorios deben ser completados'
      });
    }

    // Verificar si ya existe
    const socioExistente = await Socio.findOne({ where: { identidad } });
    
    if (socioExistente) {
      return res.status(400).json({
        error: 'Ya existe un socio con esta identidad'
      });
    }

    // Crear socio
    const nuevoSocio = await Socio.create({
      identidad,
      nombre,
      apellido,
      fecha_nacimiento,
      genero,
      telefono,
      celular,
      email,
      direccion,
      ciudad,
      departamento,
      tipo: tipo || 'socio',
      ocupacion,
      lugar_trabajo,
      ingresos_mensuales
    });

    res.status(201).json({
      mensaje: 'Socio creado exitosamente',
      socio: nuevoSocio
    });

  } catch (error) {
    console.error('Error al crear socio:', error);
    res.status(500).json({
      error: 'Error al crear socio'
    });
  }
};

/**
 * Actualizar un socio
 */
const actualizarSocio = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const socio = await Socio.findByPk(id);

    if (!socio) {
      return res.status(404).json({
        error: 'Socio no encontrado'
      });
    }

    await socio.update(datos);

    res.json({
      mensaje: 'Socio actualizado exitosamente',
      socio
    });

  } catch (error) {
    console.error('Error al actualizar socio:', error);
    res.status(500).json({
      error: 'Error al actualizar socio'
    });
  }
};

/**
 * Eliminar/desactivar un socio
 */
const eliminarSocio = async (req, res) => {
  try {
    const { id } = req.params;

    const socio = await Socio.findByPk(id);

    if (!socio) {
      return res.status(404).json({
        error: 'Socio no encontrado'
      });
    }

    // Cambiar estado a inactivo en lugar de eliminar
    await socio.update({ estado: 'inactivo' });

    res.json({
      mensaje: 'Socio desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar socio:', error);
    res.status(500).json({
      error: 'Error al eliminar socio'
    });
  }
};

module.exports = {
  obtenerSocios,
  obtenerSocioPorId,
  crearSocio,
  actualizarSocio,
  eliminarSocio
};

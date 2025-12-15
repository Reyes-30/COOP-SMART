const { Socio, Cuenta, Prestamo, Pago, Transaccion, Usuario, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * CONTROLADOR DE REPORTES
 * Genera diferentes tipos de reportes con datos agregados
 */

// 📊 Reporte: Resumen Financiero General
exports.getResumenFinanciero = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const resultado = await sequelize.query(`
      SELECT 
        -- Total de Socios
        (SELECT COUNT(*) FROM socios WHERE estado = 'activo') as total_socios_activos,
        (SELECT COUNT(*) FROM socios) as total_socios,
        
        -- Cuentas
        (SELECT COUNT(*) FROM cuentas WHERE estado = 'activa') as total_cuentas_activas,
        (SELECT COALESCE(SUM(saldo), 0) FROM cuentas WHERE estado = 'activa') as saldo_total_cuentas,
        
        -- Préstamos
        (SELECT COUNT(*) FROM prestamos WHERE estado IN ('aprobado', 'activo', 'desembolsado')) as prestamos_activos,
        (SELECT COUNT(*) FROM prestamos WHERE estado IN ('solicitado', 'en_revision')) as prestamos_pendientes,
        (SELECT COALESCE(SUM(monto_aprobado), 0) FROM prestamos WHERE estado IN ('aprobado', 'activo', 'desembolsado')) as monto_total_prestamos,
        (SELECT COALESCE(SUM(saldo_pendiente), 0) FROM prestamos WHERE estado IN ('aprobado', 'activo', 'desembolsado')) as saldo_pendiente_total,
        
        -- Pagos del período
        (SELECT COALESCE(SUM(monto), 0) 
         FROM pagos 
         WHERE fecha_pago >= :fechaInicio AND fecha_pago <= :fechaFin) as total_pagos_periodo,
        (SELECT COUNT(*) 
         FROM pagos 
         WHERE fecha_pago >= :fechaInicio AND fecha_pago <= :fechaFin) as cantidad_pagos_periodo,
        
        -- Transacciones del período
        (SELECT COALESCE(SUM(monto), 0) 
         FROM transacciones 
         WHERE tipo = 'deposito' AND fecha_transaccion >= :fechaInicio AND fecha_transaccion <= :fechaFin) as total_depositos,
        (SELECT COALESCE(SUM(monto), 0) 
         FROM transacciones 
         WHERE tipo = 'retiro' AND fecha_transaccion >= :fechaInicio AND fecha_transaccion <= :fechaFin) as total_retiros,
        (SELECT COUNT(*) 
         FROM transacciones 
         WHERE fecha_transaccion >= :fechaInicio AND fecha_transaccion <= :fechaFin) as total_transacciones
    `, {
      replacements: {
        fechaInicio: fechaInicio || '2000-01-01',
        fechaFin: fechaFin || '2099-12-31'
      },
      type: QueryTypes.SELECT
    });

    res.json(resultado[0]);
  } catch (error) {
    console.error('Error al obtener resumen financiero:', error);
    res.status(500).json({ error: 'Error al generar resumen financiero' });
  }
};

// 👥 Reporte: Socios por Estado
exports.getSociosPorEstado = async (req, res) => {
  try {
    const resultado = await sequelize.query(`
      SELECT 
        estado,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM socios), 2) as porcentaje
      FROM socios
      GROUP BY estado
      ORDER BY cantidad DESC
    `, { type: QueryTypes.SELECT });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener socios por estado:', error);
    res.status(500).json({ error: 'Error al generar reporte de socios' });
  }
};

// 💳 Reporte: Cuentas por Tipo
exports.getCuentasPorTipo = async (req, res) => {
  try {
    const resultado = await sequelize.query(`
      SELECT 
        tipo_cuenta,
        COUNT(*) as cantidad,
        COALESCE(SUM(saldo), 0) as saldo_total,
        ROUND(AVG(saldo), 2) as saldo_promedio,
        MAX(saldo) as saldo_maximo,
        MIN(saldo) as saldo_minimo
      FROM cuentas
      WHERE estado = 'activa'
      GROUP BY tipo_cuenta
      ORDER BY saldo_total DESC
    `, { type: QueryTypes.SELECT });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener cuentas por tipo:', error);
    res.status(500).json({ error: 'Error al generar reporte de cuentas' });
  }
};

// 💵 Reporte: Préstamos Detallado
exports.getPrestamosDetallado = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, estado } = req.query;

    let whereClause = '1=1';
    const replacements = {};

    if (fechaInicio && fechaFin) {
      whereClause += ' AND p.fecha_solicitud >= :fechaInicio AND p.fecha_solicitud <= :fechaFin';
      replacements.fechaInicio = fechaInicio;
      replacements.fechaFin = fechaFin;
    }

    if (estado) {
      whereClause += ' AND p.estado = :estado';
      replacements.estado = estado;
    }

    const resultado = await sequelize.query(`
      SELECT 
        p.id,
        p.fecha_solicitud,
        s.nombre as socio_nombre,
        s.apellido as socio_apellido,
        s.identidad as socio_identificacion,
        p.monto_aprobado as monto,
        p.tasa_interes,
        p.plazo_meses,
        p.cuota_mensual,
        p.saldo_pendiente,
        p.estado,
        p.fecha_aprobacion,
        (SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id) as pagos_realizados,
        (SELECT COALESCE(SUM(monto), 0) FROM pagos WHERE id_prestamo = p.id) as total_pagado
      FROM prestamos p
      INNER JOIN socios s ON p.id_socio = s.id
      WHERE ${whereClause}
      ORDER BY p.fecha_solicitud DESC
    `, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener préstamos detallado:', error);
    res.status(500).json({ error: 'Error al generar reporte de préstamos' });
  }
};

// 📉 Reporte: Préstamos en Mora
exports.getPrestamosEnMora = async (req, res) => {
  try {
    const resultado = await sequelize.query(`
      SELECT 
        p.id,
        s.nombre,
        s.apellido,
        s.identidad as identificacion,
        s.telefono,
        p.monto_aprobado as monto,
        p.saldo_pendiente,
        p.cuota_mensual,
        p.fecha_solicitud,
        p.plazo_meses,
        (SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id) as pagos_realizados,
        (p.plazo_meses - (SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id)) as cuotas_pendientes,
        DATEDIFF(CURDATE(), 
          DATE_ADD(p.fecha_aprobacion, 
            INTERVAL (SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id) + 1 MONTH)
        ) as dias_mora
      FROM prestamos p
      INNER JOIN socios s ON p.id_socio = s.id
      WHERE p.estado IN ('aprobado', 'activo', 'desembolsado')
        AND DATEDIFF(CURDATE(), 
          DATE_ADD(p.fecha_aprobacion, 
            INTERVAL (SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id) + 1 MONTH)
        ) > 0
      ORDER BY dias_mora DESC
    `, { type: QueryTypes.SELECT });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener préstamos en mora:', error);
    res.status(500).json({ error: 'Error al generar reporte de mora' });
  }
};

// 💸 Reporte: Pagos por Período
exports.getPagosPorPeriodo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const resultado = await sequelize.query(`
      SELECT 
        DATE_FORMAT(pg.fecha_pago, '%Y-%m') as mes,
        COUNT(*) as cantidad_pagos,
        COALESCE(SUM(pg.monto), 0) as total_pagado,
        ROUND(AVG(pg.monto), 2) as promedio_pago
      FROM pagos pg
      WHERE pg.fecha_pago >= :fechaInicio 
        AND pg.fecha_pago <= :fechaFin
      GROUP BY DATE_FORMAT(pg.fecha_pago, '%Y-%m')
      ORDER BY mes ASC
    `, {
      replacements: {
        fechaInicio: fechaInicio || '2000-01-01',
        fechaFin: fechaFin || '2099-12-31'
      },
      type: QueryTypes.SELECT
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener pagos por período:', error);
    res.status(500).json({ error: 'Error al generar reporte de pagos' });
  }
};

// 📝 Reporte: Transacciones por Tipo y Período
exports.getTransaccionesPorTipo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const resultado = await sequelize.query(`
      SELECT 
        t.tipo,
        COUNT(*) as cantidad,
        COALESCE(SUM(t.monto), 0) as monto_total,
        ROUND(AVG(t.monto), 2) as monto_promedio
      FROM transacciones t
      WHERE t.fecha >= :fechaInicio 
        AND t.fecha <= :fechaFin
      GROUP BY t.tipo
      ORDER BY monto_total DESC
    `, {
      replacements: {
        fechaInicio: fechaInicio || '2000-01-01',
        fechaFin: fechaFin || '2099-12-31'
      },
      type: QueryTypes.SELECT
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener transacciones por tipo:', error);
    res.status(500).json({ error: 'Error al generar reporte de transacciones' });
  }
};

// 📊 Reporte: Evolución de Saldos Mensuales
exports.getEvolucionSaldos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const resultado = await sequelize.query(`
      SELECT 
        DATE_FORMAT(t.fecha_transaccion, '%Y-%m') as mes,
        SUM(CASE WHEN t.tipo = 'deposito' THEN t.monto ELSE 0 END) as depositos,
        SUM(CASE WHEN t.tipo = 'retiro' THEN t.monto ELSE 0 END) as retiros,
        SUM(CASE WHEN t.tipo = 'deposito' THEN t.monto ELSE -t.monto END) as saldo_neto
      FROM transacciones t
      WHERE t.fecha_transaccion >= :fechaInicio 
        AND t.fecha_transaccion <= :fechaFin
      GROUP BY DATE_FORMAT(t.fecha_transaccion, '%Y-%m')
      ORDER BY mes ASC
    `, {
      replacements: {
        fechaInicio: fechaInicio || '2000-01-01',
        fechaFin: fechaFin || '2099-12-31'
      },
      type: QueryTypes.SELECT
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener evolución de saldos:', error);
    res.status(500).json({ error: 'Error al generar reporte de evolución' });
  }
};

// 🏆 Reporte: Top Socios (por saldo total)
exports.getTopSocios = async (req, res) => {
  try {
    const { limite = 10 } = req.query;

    const resultado = await sequelize.query(`
      SELECT 
        s.id,
        s.nombre,
        s.apellido,
        s.identidad as identificacion,
        s.fecha_ingreso,
        COUNT(DISTINCT c.id) as total_cuentas,
        COALESCE(SUM(c.saldo), 0) as saldo_total,
        COUNT(DISTINCT p.id) as total_prestamos,
        COALESCE(SUM(p.saldo_pendiente), 0) as deuda_total
      FROM socios s
      LEFT JOIN cuentas c ON s.id = c.id_socio AND c.estado = 'activa'
      LEFT JOIN prestamos p ON s.id = p.id_socio AND p.estado IN ('aprobado', 'activo', 'desembolsado')
      WHERE s.estado = 'activo'
      GROUP BY s.id, s.nombre, s.apellido, s.identidad, s.fecha_ingreso
      ORDER BY saldo_total DESC
      LIMIT :limite
    `, {
      replacements: { limite: parseInt(limite) },
      type: QueryTypes.SELECT
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener top socios:', error);
    res.status(500).json({ error: 'Error al generar reporte de top socios' });
  }
};

// 📈 Reporte: Estadísticas de Crecimiento
exports.getEstadisticasCrecimiento = async (req, res) => {
  try {
    const resultado = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fecha_ingreso, '%Y-%m') as mes,
        COUNT(*) as nuevos_socios
      FROM socios
      WHERE fecha_ingreso >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha_ingreso, '%Y-%m')
      ORDER BY mes ASC
    `, { type: QueryTypes.SELECT });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener estadísticas de crecimiento:', error);
    res.status(500).json({ error: 'Error al generar estadísticas de crecimiento' });
  }
};

// 💰 Reporte: Análisis de Rentabilidad
exports.getAnalisisRentabilidad = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const resultado = await sequelize.query(`
      SELECT 
        -- Ingresos por intereses de préstamos
        (SELECT COALESCE(SUM(p.monto_aprobado * (p.tasa_interes / 100) * (p.plazo_meses / 12)), 0)
         FROM prestamos p
         WHERE p.estado IN ('aprobado', 'activo', 'desembolsado')
           AND p.fecha_aprobacion >= :fechaInicio 
           AND p.fecha_aprobacion <= :fechaFin) as ingresos_intereses,
        
        -- Total de pagos recibidos
        (SELECT COALESCE(SUM(monto), 0)
         FROM pagos
         WHERE fecha_pago >= :fechaInicio 
           AND fecha_pago <= :fechaFin) as total_pagos_recibidos,
        
        -- Préstamos desembolsados
        (SELECT COALESCE(SUM(monto_aprobado), 0)
         FROM prestamos
         WHERE estado IN ('aprobado', 'activo', 'desembolsado')
           AND fecha_aprobacion >= :fechaInicio 
           AND fecha_aprobacion <= :fechaFin) as total_desembolsado,
        
        -- Cantidad de préstamos aprobados
        (SELECT COUNT(*)
         FROM prestamos
         WHERE estado IN ('aprobado', 'activo', 'desembolsado')
           AND fecha_aprobacion >= :fechaInicio 
           AND fecha_aprobacion <= :fechaFin) as prestamos_aprobados,
        
        -- Saldo total en cuentas
        (SELECT COALESCE(SUM(saldo), 0)
         FROM cuentas
         WHERE estado = 'activa') as saldo_total_sistema
    `, {
      replacements: {
        fechaInicio: fechaInicio || '2000-01-01',
        fechaFin: fechaFin || '2099-12-31'
      },
      type: QueryTypes.SELECT
    });

    res.json(resultado[0]);
  } catch (error) {
    console.error('Error al obtener análisis de rentabilidad:', error);
    res.status(500).json({ error: 'Error al generar análisis de rentabilidad' });
  }
};

// 📊 Reporte: Distribución de Préstamos por Rango de Monto
exports.getPrestamosRangoMonto = async (req, res) => {
  try {
    const resultado = await sequelize.query(`
      SELECT 
        CASE
          WHEN monto_aprobado < 10000 THEN 'Menos de L. 10,000'
          WHEN monto_aprobado >= 10000 AND monto_aprobado < 50000 THEN 'L. 10,000 - L. 50,000'
          WHEN monto_aprobado >= 50000 AND monto_aprobado < 100000 THEN 'L. 50,000 - L. 100,000'
          WHEN monto_aprobado >= 100000 AND monto_aprobado < 200000 THEN 'L. 100,000 - L. 200,000'
          ELSE 'Más de L. 200,000'
        END as rango_monto,
        COUNT(*) as cantidad,
        COALESCE(SUM(monto_aprobado), 0) as total_monto,
        ROUND(AVG(tasa_interes), 2) as tasa_promedio
      FROM prestamos
      WHERE estado IN ('aprobado', 'activo', 'desembolsado')
      GROUP BY rango_monto
      ORDER BY MIN(monto_aprobado)
    `, { type: QueryTypes.SELECT });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener préstamos por rango de monto:', error);
    res.status(500).json({ error: 'Error al generar reporte de rangos' });
  }
};

// 💳 Reporte: Movimientos de Cuenta Específica
exports.getMovimientosCuenta = async (req, res) => {
  try {
    const { cuentaId, fechaInicio, fechaFin } = req.query;

    if (!cuentaId) {
      return res.status(400).json({ error: 'Se requiere el ID de la cuenta' });
    }

    const resultado = await sequelize.query(`
      SELECT 
        t.id,
        t.tipo,
        t.monto,
        t.descripcion,
        t.fecha_transaccion as fecha,
        c.numero_cuenta,
        c.tipo_cuenta,
        s.nombre as socio_nombre,
        s.apellido as socio_apellido
      FROM transacciones t
      INNER JOIN cuentas c ON t.id_cuenta = c.id
      INNER JOIN socios s ON c.id_socio = s.id
      WHERE t.id_cuenta = :cuentaId
        AND t.fecha_transaccion >= :fechaInicio
        AND t.fecha_transaccion <= :fechaFin
      ORDER BY t.fecha_transaccion DESC
    `, {
      replacements: {
        cuentaId,
        fechaInicio: fechaInicio || '2000-01-01',
        fechaFin: fechaFin || '2099-12-31'
      },
      type: QueryTypes.SELECT
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener movimientos de cuenta:', error);
    res.status(500).json({ error: 'Error al generar reporte de movimientos' });
  }
};

// 👤 Reporte: Estado de Cuenta Individual de Socio
exports.getEstadoCuentaSocio = async (req, res) => {
  try {
    const { socioId } = req.query;

    if (!socioId) {
      return res.status(400).json({ error: 'Se requiere el ID del socio' });
    }

    const resultado = await sequelize.query(`
      SELECT 
        s.id,
        s.nombre,
        s.apellido,
        s.identidad as identificacion,
        s.telefono,
        s.email,
        s.fecha_ingreso,
        s.estado,
        
        -- Cuentas
        (SELECT COUNT(*) FROM cuentas WHERE id_socio = s.id AND estado = 'activa') as total_cuentas,
        (SELECT COALESCE(SUM(saldo), 0) FROM cuentas WHERE id_socio = s.id AND estado = 'activa') as saldo_total,
        
        -- Préstamos
        (SELECT COUNT(*) FROM prestamos WHERE id_socio = s.id AND estado IN ('aprobado', 'activo', 'desembolsado')) as prestamos_activos,
        (SELECT COALESCE(SUM(monto_aprobado), 0) FROM prestamos WHERE id_socio = s.id AND estado IN ('aprobado', 'activo', 'desembolsado')) as monto_prestamos,
        (SELECT COALESCE(SUM(saldo_pendiente), 0) FROM prestamos WHERE id_socio = s.id AND estado IN ('aprobado', 'activo', 'desembolsado')) as deuda_total,
        
        -- Pagos realizados
        (SELECT COUNT(*) 
         FROM pagos pg 
         INNER JOIN prestamos pr ON pg.id_prestamo = pr.id 
         WHERE pr.id_socio = s.id) as total_pagos,
        (SELECT COALESCE(SUM(pg.monto), 0) 
         FROM pagos pg 
         INNER JOIN prestamos pr ON pg.id_prestamo = pr.id 
         WHERE pr.id_socio = s.id) as total_pagado
      FROM socios s
      WHERE s.id = :socioId
    `, {
      replacements: { socioId },
      type: QueryTypes.SELECT
    });

    if (resultado.length === 0) {
      return res.status(404).json({ error: 'Socio no encontrado' });
    }

    // Obtener detalle de cuentas
    const cuentas = await sequelize.query(`
      SELECT 
        id,
        numero_cuenta,
        tipo_cuenta,
        saldo,
        fecha_apertura,
        estado
      FROM cuentas
      WHERE id_socio = :socioId
      ORDER BY fecha_apertura DESC
    `, {
      replacements: { socioId },
      type: QueryTypes.SELECT
    });

    // Obtener detalle de préstamos
    const prestamos = await sequelize.query(`
      SELECT 
        id,
        monto_aprobado as monto,
        tasa_interes,
        plazo_meses,
        cuota_mensual,
        saldo_pendiente,
        fecha_solicitud,
        fecha_aprobacion,
        estado
      FROM prestamos
      WHERE id_socio = :socioId
      ORDER BY fecha_solicitud DESC
    `, {
      replacements: { socioId },
      type: QueryTypes.SELECT
    });

    res.json({
      socio: resultado[0],
      cuentas,
      prestamos
    });
  } catch (error) {
    console.error('Error al obtener estado de cuenta de socio:', error);
    res.status(500).json({ error: 'Error al generar estado de cuenta' });
  }
};

// 📅 Reporte: Proyección de Pagos Próximos
exports.getProyeccionPagos = async (req, res) => {
  try {
    const { dias = 30 } = req.query;

    const resultado = await sequelize.query(`
      SELECT 
        p.id as prestamo_id,
        s.nombre,
        s.apellido,
        s.identidad as identificacion,
        s.telefono,
        p.monto_aprobado as monto,
        p.cuota_mensual,
        p.plazo_meses,
        (SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id) as pagos_realizados,
        (p.plazo_meses - (SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id)) as cuotas_pendientes,
        DATE_ADD(p.fecha_aprobacion, 
          INTERVAL ((SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id) + 1) MONTH) as fecha_proximo_pago,
        DATEDIFF(DATE_ADD(p.fecha_aprobacion, 
          INTERVAL ((SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id) + 1) MONTH), CURDATE()) as dias_hasta_pago
      FROM prestamos p
      INNER JOIN socios s ON p.id_socio = s.id
      WHERE p.estado IN ('aprobado', 'activo', 'desembolsado')
        AND (p.plazo_meses - (SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id)) > 0
        AND DATEDIFF(DATE_ADD(p.fecha_aprobacion, 
          INTERVAL ((SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id) + 1) MONTH), CURDATE()) <= :dias
      ORDER BY fecha_proximo_pago ASC
    `, {
      replacements: { dias: parseInt(dias) },
      type: QueryTypes.SELECT
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener proyección de pagos:', error);
    res.status(500).json({ error: 'Error al generar proyección de pagos' });
  }
};

// 📈 Reporte: Comparativa Mensual (Año Actual vs Año Anterior)
exports.getComparativaMensual = async (req, res) => {
  try {
    const resultado = await sequelize.query(`
      SELECT 
        mes,
        SUM(CASE WHEN anio = YEAR(CURDATE()) THEN total ELSE 0 END) as actual,
        SUM(CASE WHEN anio = YEAR(CURDATE()) - 1 THEN total ELSE 0 END) as anterior
      FROM (
        SELECT 
          MONTH(fecha_pago) as mes,
          YEAR(fecha_pago) as anio,
          SUM(monto) as total
        FROM pagos
        WHERE YEAR(fecha_pago) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)
        GROUP BY YEAR(fecha_pago), MONTH(fecha_pago)
      ) as datos
      GROUP BY mes
      ORDER BY mes
    `, { type: QueryTypes.SELECT });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener comparativa mensual:', error);
    res.status(500).json({ error: 'Error al generar comparativa mensual' });
  }
};

// 🏦 Reporte: Resumen Ejecutivo Completo
exports.getResumenEjecutivo = async (req, res) => {
  try {
    const resultado = await sequelize.query(`
      SELECT 
        -- Socios
        (SELECT COUNT(*) FROM socios WHERE estado = 'activo') as socios_activos,
        (SELECT COUNT(*) FROM socios WHERE DATE(fecha_ingreso) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as nuevos_socios_mes,
        
        -- Cuentas y Saldos
        (SELECT COUNT(*) FROM cuentas WHERE estado = 'activa') as cuentas_activas,
        (SELECT COALESCE(SUM(saldo), 0) FROM cuentas WHERE estado = 'activa') as saldo_total,
        (SELECT COALESCE(AVG(saldo), 0) FROM cuentas WHERE estado = 'activa') as saldo_promedio,
        
        -- Préstamos
        (SELECT COUNT(*) FROM prestamos WHERE estado IN ('aprobado', 'activo', 'desembolsado')) as prestamos_activos,
        (SELECT COUNT(*) FROM prestamos WHERE estado IN ('solicitado', 'en_revision')) as prestamos_pendientes,
        (SELECT COALESCE(SUM(monto_aprobado), 0) FROM prestamos WHERE estado IN ('aprobado', 'activo', 'desembolsado')) as cartera_total,
        (SELECT COALESCE(SUM(saldo_pendiente), 0) FROM prestamos WHERE estado IN ('aprobado', 'activo', 'desembolsado')) as cartera_vigente,
        
        -- Mora
        (SELECT COUNT(*) 
         FROM prestamos p
         WHERE p.estado IN ('aprobado', 'activo', 'desembolsado')
           AND DATEDIFF(CURDATE(), 
             DATE_ADD(p.fecha_aprobacion, 
               INTERVAL ((SELECT COUNT(*) FROM pagos WHERE id_prestamo = p.id) + 1) MONTH)) > 0) as prestamos_mora,
        
        -- Transacciones del mes
        (SELECT COUNT(*) FROM transacciones WHERE MONTH(fecha_transaccion) = MONTH(CURDATE())) as transacciones_mes,
        (SELECT COALESCE(SUM(monto), 0) FROM transacciones WHERE tipo = 'deposito' AND MONTH(fecha_transaccion) = MONTH(CURDATE())) as depositos_mes,
        (SELECT COALESCE(SUM(monto), 0) FROM transacciones WHERE tipo = 'retiro' AND MONTH(fecha_transaccion) = MONTH(CURDATE())) as retiros_mes,
        
        -- Pagos del mes
        (SELECT COUNT(*) FROM pagos WHERE MONTH(fecha_pago) = MONTH(CURDATE())) as pagos_mes,
        (SELECT COALESCE(SUM(monto), 0) FROM pagos WHERE MONTH(fecha_pago) = MONTH(CURDATE())) as total_pagado_mes
    `, { type: QueryTypes.SELECT });

    res.json(resultado[0]);
  } catch (error) {
    console.error('Error al obtener resumen ejecutivo:', error);
    res.status(500).json({ error: 'Error al generar resumen ejecutivo' });
  }
};

module.exports = exports;

/**
 * Script de Seed - Datos de Prueba para COOP-SMART
 * Genera datos realistas para Honduras
 */

const bcrypt = require('bcrypt');
const { sequelize, Usuario, Socio, Cuenta, Prestamo, Pago, Transaccion } = require('../models');

// Datos de prueba realistas para Honduras
const nombresHombres = ['José', 'Carlos', 'Luis', 'Miguel', 'Juan', 'Pedro', 'Mario', 'Roberto', 'Francisco', 'Antonio', 'Jorge', 'Manuel', 'Rafael', 'Eduardo', 'Fernando'];
const nombresMujeres = ['María', 'Ana', 'Rosa', 'Carmen', 'Teresa', 'Marta', 'Laura', 'Patricia', 'Claudia', 'Sandra', 'Gabriela', 'Diana', 'Silvia', 'Andrea', 'Mónica'];
const apellidos = ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Jiménez', 'Álvarez', 'Romero', 'Vargas', 'Castro', 'Ortiz', 'Ruiz', 'Mendoza'];

// Generar DNI aleatorio (Honduras: 13 dígitos)
function generarIdentidad() {
  let identidad = '';
  for (let i = 0; i < 13; i++) {
    identidad += Math.floor(Math.random() * 10);
  }
  return identidad;
}

// Generar número de teléfono (Honduras: 8 dígitos)
function generarTelefono() {
  const prefijos = ['9', '8', '3', '2'];
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  let telefono = prefijo;
  for (let i = 0; i < 7; i++) {
    telefono += Math.floor(Math.random() * 10);
  }
  return telefono;
}

// Generar email
function generarEmail(nombre, apellido) {
  return `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.com`;
}

// Generar dirección
function generarDireccion() {
  const ciudades = ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'Choluteca', 'Comayagua', 'Danlí', 'El Progreso', 'Juticalpa'];
  const colonias = ['Col. Kennedy', 'Col. Las Hadas', 'Barrio La Granja', 'Col. Palmira', 'Barrio El Centro', 'Col. Torocagua', 'Barrio Morazán', 'Col. Tepeyac'];
  
  const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
  const colonia = colonias[Math.floor(Math.random() * colonias.length)];
  const calle = Math.floor(Math.random() * 50) + 1;
  const casa = Math.floor(Math.random() * 100) + 1;
  
  return `${colonia}, Calle ${calle}, Casa ${casa}, ${ciudad}`;
}

// Generar fecha aleatoria en un rango
function generarFecha(diasAtras, diasAdelante = 0) {
  const hoy = new Date();
  const dias = Math.floor(Math.random() * (diasAtras + diasAdelante)) - diasAtras;
  const fecha = new Date(hoy.getTime() + dias * 24 * 60 * 60 * 1000);
  return fecha.toISOString().split('T')[0];
}

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...\n');

    // 1. Limpiar datos existentes (opcional - comentar si no quieres borrar)
    console.log('🗑️  Limpiando datos existentes...');
    await Pago.destroy({ where: {}, force: true });
    await Transaccion.destroy({ where: {}, force: true });
    await Prestamo.destroy({ where: {}, force: true });
    await Cuenta.destroy({ where: {}, force: true });
    await Socio.destroy({ where: {}, force: true });
    console.log('✅ Datos limpiados\n');

    // 2. Crear Usuarios adicionales (omitir si ya existen)
    console.log('👥 Verificando usuarios...');
    let usuariosCreados = 0;
    
    const usuariosData = [
      {
        nombre_usuario: 'cajero1',
        nombre_completo: 'Ana Patricia López',
        email: 'cajero1@coopsmart.com',
        password: await bcrypt.hash('Coop2024', 10),
        rol: 'cajero',
        activo: true
      },
      {
        nombre_usuario: 'gerente1',
        nombre_completo: 'Carlos Enrique García',
        email: 'gerente@coopsmart.com',
        password: await bcrypt.hash('Coop2024', 10),
        rol: 'gerente',
        activo: true
      }
    ];
    
    for (const userData of usuariosData) {
      const existe = await Usuario.findOne({ where: { nombre_usuario: userData.nombre_usuario } });
      if (!existe) {
        await Usuario.create(userData);
        usuariosCreados++;
      }
    }
    
    console.log(`✅ ${usuariosCreados} usuarios nuevos creados\n`);

    // 3. Crear 25 Socios
    console.log('👨‍👩‍👧‍👦 Creando 25 socios...');
    const sociosData = [];
    
    for (let i = 0; i < 25; i++) {
      const esHombre = Math.random() > 0.5;
      const nombre = esHombre 
        ? nombresHombres[Math.floor(Math.random() * nombresHombres.length)]
        : nombresMujeres[Math.floor(Math.random() * nombresMujeres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      const segundoApellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      
      const fechaNacimiento = new Date();
      fechaNacimiento.setFullYear(fechaNacimiento.getFullYear() - (Math.floor(Math.random() * 40) + 20));
      
      sociosData.push({
        numero_socio: `SOC-${String(i + 1).padStart(5, '0')}`,
        tipo: Math.random() > 0.7 ? 'juridico' : 'natural',
        nombre: nombre,
        apellido: `${apellido} ${segundoApellido}`,
        nombre_completo: `${nombre} ${apellido} ${segundoApellido}`,
        identidad: generarIdentidad(),
        fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
        sexo: esHombre ? 'M' : 'F',
        estado_civil: ['soltero', 'casado', 'union_libre', 'divorciado'][Math.floor(Math.random() * 4)],
        telefono: generarTelefono(),
        email: generarEmail(nombre, apellido),
        direccion: generarDireccion(),
        ocupacion: ['Empleado', 'Comerciante', 'Profesional', 'Agricultor', 'Empresario'][Math.floor(Math.random() * 5)],
        ingresos_mensuales: (Math.floor(Math.random() * 30) + 10) * 1000,
        fecha_ingreso: generarFecha(730, 0), // Últimos 2 años
        estado: Math.random() > 0.9 ? 'inactivo' : 'activo',
        notas: i % 5 === 0 ? 'Socio fundador' : null
      });
    }
    
    const socios = await Socio.bulkCreate(sociosData);
    console.log(`✅ ${socios.length} socios creados\n`);

    // 4. Crear Cuentas (35 cuentas - algunos socios tienen múltiples cuentas)
    console.log('🏦 Creando cuentas...');
    const cuentasData = [];
    let numeroCuenta = 1000;
    
    socios.forEach((socio, index) => {
      // Cuenta principal (Ahorro)
      cuentasData.push({
        id_socio: socio.id,
        numero_cuenta: `${numeroCuenta++}`,
        tipo: 'ahorro',
        saldo: (Math.floor(Math.random() * 50) + 5) * 1000,
        tasa_interes: 2.5,
        fecha_apertura: socio.fecha_ingreso,
        estado: 'activa'
      });
      
      // Algunos socios tienen cuenta corriente
      if (index % 3 === 0) {
        cuentasData.push({
          id_socio: socio.id,
          numero_cuenta: `${numeroCuenta++}`,
          tipo: 'corriente',
          saldo: (Math.floor(Math.random() * 100) + 10) * 1000,
          tasa_interes: 0,
          fecha_apertura: socio.fecha_ingreso,
          estado: 'activa'
        });
      }
      
      // Algunos tienen plazo fijo
      if (index % 5 === 0) {
        cuentasData.push({
          id_socio: socio.id,
          numero_cuenta: `${numeroCuenta++}`,
          tipo: 'plazo_fijo',
          saldo: (Math.floor(Math.random() * 200) + 50) * 1000,
          tasa_interes: 6.5,
          fecha_apertura: socio.fecha_ingreso,
          plazo_meses: 12,
          fecha_vencimiento: generarFecha(-180, 180),
          estado: 'activa'
        });
      }
    });
    
    const cuentas = await Cuenta.bulkCreate(cuentasData);
    console.log(`✅ ${cuentas.length} cuentas creadas\n`);

    // 5. Crear Préstamos (20 préstamos)
    console.log('💰 Creando préstamos...');
    const prestamosData = [];
    
    for (let i = 0; i < 20; i++) {
      const socio = socios[Math.floor(Math.random() * socios.length)];
      const monto = (Math.floor(Math.random() * 100) + 20) * 1000; // 20k - 120k
      const tasaInteres = 12 + Math.random() * 6; // 12% - 18%
      const plazoMeses = [12, 18, 24, 36, 48][Math.floor(Math.random() * 5)];
      
      // Calcular cuota mensual (fórmula de amortización)
      const tasaMensual = tasaInteres / 100 / 12;
      const cuotaMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                           (Math.pow(1 + tasaMensual, plazoMeses) - 1);
      
      const fechaSolicitud = generarFecha(365, 0);
      const fechaAprobacion = new Date(fechaSolicitud);
      fechaAprobacion.setDate(fechaAprobacion.getDate() + Math.floor(Math.random() * 15) + 3);
      
      const estados = ['aprobado', 'aprobado', 'aprobado', 'aprobado', 'pagado', 'activo'];
      
      prestamosData.push({
        numero_prestamo: `PRE-${String(i + 1).padStart(6, '0')}`,
        id_socio: socio.id,
        monto_solicitado: monto,
        monto_aprobado: monto,
        tasa_interes: tasaInteres,
        plazo_meses: plazoMeses,
        cuota_mensual: cuotaMensual,
        saldo_pendiente: monto,
        tipo_prestamo: ['personal', 'vehicular', 'hipotecario', 'comercial', 'emergencia'][Math.floor(Math.random() * 5)],
        proposito: ['Negocio', 'Vivienda', 'Vehículo', 'Educación', 'Consolidación deudas'][Math.floor(Math.random() * 5)],
        estado: estados[Math.floor(Math.random() * estados.length)],
        fecha_solicitud: fechaSolicitud,
        fecha_aprobacion: fechaAprobacion.toISOString().split('T')[0],
        fecha_desembolso: fechaAprobacion.toISOString().split('T')[0],
        aprobado_por: 4, // Usuario administrador
        garantia: 'Hipoteca sobre propiedad / Aval solidario'
      });
    }
    
    const prestamos = await Prestamo.bulkCreate(prestamosData);
    console.log(`✅ ${prestamos.length} préstamos creados\n`);

    // 6. Crear Pagos (para préstamos aprobados)
    console.log('💵 Creando pagos...');
    const pagosData = [];
    
    prestamos.forEach((prestamo, index) => {
      if (prestamo.estado === 'aprobado' || prestamo.estado === 'activo') {
        // Cada préstamo tiene entre 1 y 6 pagos
        const numPagos = Math.floor(Math.random() * 6) + 1;
        
        for (let i = 1; i <= numPagos; i++) {
          const fechaAprobacion = new Date(prestamo.fecha_aprobacion);
          const fechaPago = new Date(fechaAprobacion);
          fechaPago.setMonth(fechaPago.getMonth() + i);
          
          const tasaMensual = prestamo.tasa_interes / 100 / 12;
          const saldoRestante = prestamo.monto_aprobado - ((i - 1) * (prestamo.cuota_mensual - prestamo.monto_aprobado * tasaMensual));
          const interes = saldoRestante * tasaMensual;
          const capital = prestamo.cuota_mensual - interes;
          
          pagosData.push({
            numero_recibo: `REC-${String(index + 1).padStart(4, '0')}-${String(i).padStart(2, '0')}`,
            id_prestamo: prestamo.id,
            numero_cuota: i,
            monto: prestamo.cuota_mensual,
            monto_capital: capital,
            monto_interes: interes,
            mora: 0,
            tipo_pago: 'cuota_regular',
            metodo_pago: ['efectivo', 'transferencia', 'cheque', 'tarjeta'][Math.floor(Math.random() * 4)],
            fecha_pago: fechaPago,
            recibido_por: 4,
            referencia: `REF-${Date.now()}-${i}`,
            notas: i === 1 ? 'Primer pago del préstamo' : null
          });
        }
      }
    });
    
    const pagos = await Pago.bulkCreate(pagosData);
    console.log(`✅ ${pagos.length} pagos creados\n`);

    // 7. Crear Transacciones (50 transacciones)
    console.log('📝 Creando transacciones...');
    const transaccionesData = [];
    
    for (let i = 0; i < 50; i++) {
      const cuenta = cuentas[Math.floor(Math.random() * cuentas.length)];
      const tipo = ['deposito', 'retiro', 'transferencia'][Math.floor(Math.random() * 3)];
      const monto = (Math.floor(Math.random() * 20) + 1) * 500; // 500 - 10,000
      
      transaccionesData.push({
        numero_transaccion: `TRX-${String(i + 1).padStart(8, '0')}`,
        id_cuenta: cuenta.id,
        tipo: tipo,
        monto: monto,
        saldo_anterior: cuenta.saldo,
        saldo_nuevo: tipo === 'deposito' ? cuenta.saldo + monto : cuenta.saldo - monto,
        descripcion: tipo === 'deposito' ? 'Depósito en efectivo' : tipo === 'retiro' ? 'Retiro en ventanilla' : 'Transferencia bancaria',
        fecha_transaccion: generarFecha(60, 0),
        realizado_por: 4,
        estado: 'completada'
      });
    }
    
    const transacciones = await Transaccion.bulkCreate(transaccionesData);
    console.log(`✅ ${transacciones.length} transacciones creadas\n`);

    // Resumen
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SEED COMPLETADO EXITOSAMENTE\n');
    console.log('📊 Resumen de datos creados:');
    console.log(`   👥 Socios: ${socios.length}`);
    console.log(`   🏦 Cuentas: ${cuentas.length}`);
    console.log(`   💰 Préstamos: ${prestamos.length}`);
    console.log(`   💵 Pagos: ${pagos.length}`);
    console.log(`   📝 Transacciones: ${transacciones.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎉 ¡Base de datos poblada con datos de prueba!');
    console.log('📍 Ahora puedes probar todos los módulos del sistema\n');

  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    throw error;
  }
}

// Ejecutar si se corre directamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;

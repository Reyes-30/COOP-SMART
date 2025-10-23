/**
 * Script de inicialización y seeding de la base de datos
 * Crea datos de prueba para desarrollo
 */

require('dotenv').config();
require('../config/mongo'); // Conectar MongoDB
const { 
  sequelize, 
  Usuario, 
  Socio, 
  Cuenta, 
  syncDatabase 
} = require('../models');

const bcrypt = require('bcrypt');

const inicializarDB = async () => {
  try {
    console.log('🚀 Iniciando sincronización de base de datos...\n');

    // Sincronizar modelos
    await syncDatabase();

    // Verificar si ya existen datos
    const usuariosExistentes = await Usuario.count();
    
    if (usuariosExistentes > 0) {
      console.log('⚠️  La base de datos ya contiene datos.');
      console.log('   Para reinicializar, elimina la base de datos y vuelve a ejecutar este script.\n');
      process.exit(0);
    }

    console.log('📝 Creando datos de prueba...\n');

    // Crear usuarios de prueba
    const passwordHash = await bcrypt.hash('admin123', 10);

    const usuarios = await Usuario.bulkCreate([
      {
        nombre_usuario: 'admin',
        email: 'admin@coopsmart.com',
        contrasena_hash: passwordHash,
        rol: 'administrador',
        nombre_completo: 'Administrador del Sistema'
      },
      {
        nombre_usuario: 'cajero1',
        email: 'cajero1@coopsmart.com',
        contrasena_hash: passwordHash,
        rol: 'cajero',
        nombre_completo: 'María González'
      },
      {
        nombre_usuario: 'socio1',
        email: 'socio1@example.com',
        contrasena_hash: passwordHash,
        rol: 'socio',
        nombre_completo: 'Juan Pérez'
      }
    ]);

    console.log('✅ Usuarios creados:', usuarios.length);

    // Crear socios de prueba
    const socios = await Socio.bulkCreate([
      {
        identidad: '0801199012345',
        nombre: 'Juan',
        apellido: 'Pérez',
        fecha_nacimiento: '1990-05-15',
        genero: 'M',
        telefono: '22451234',
        celular: '98765432',
        email: 'juan.perez@example.com',
        direccion: 'Colonia Las Palmas, Casa #123',
        ciudad: 'Tegucigalpa',
        departamento: 'Francisco Morazán',
        tipo: 'socio',
        ocupacion: 'Ingeniero',
        lugar_trabajo: 'Empresa Tech SA',
        ingresos_mensuales: 25000.00
      },
      {
        identidad: '0801199112346',
        nombre: 'María',
        apellido: 'López',
        fecha_nacimiento: '1985-08-20',
        genero: 'F',
        telefono: '22459876',
        celular: '99887766',
        email: 'maria.lopez@example.com',
        direccion: 'Colonia Lomas del Guijarro',
        ciudad: 'Tegucigalpa',
        departamento: 'Francisco Morazán',
        tipo: 'socio',
        ocupacion: 'Doctora',
        lugar_trabajo: 'Hospital General',
        ingresos_mensuales: 35000.00
      },
      {
        identidad: '0501198512347',
        nombre: 'Carlos',
        apellido: 'Martínez',
        fecha_nacimiento: '1992-03-10',
        genero: 'M',
        telefono: '25551234',
        celular: '96543210',
        email: 'carlos.martinez@example.com',
        direccion: 'Barrio El Centro',
        ciudad: 'San Pedro Sula',
        departamento: 'Cortés',
        tipo: 'cliente',
        ocupacion: 'Comerciante',
        lugar_trabajo: 'Negocio Propio',
        ingresos_mensuales: 18000.00
      }
    ]);

    console.log('✅ Socios creados:', socios.length);

    // Crear cuentas de prueba
    const cuentas = await Cuenta.bulkCreate([
      {
        numero_cuenta: 'CA1000000001',
        id_socio: socios[0].id,
        tipo_cuenta: 'ahorro',
        saldo: 5000.00,
        tasa_interes: 2.5,
        moneda: 'HNL'
      },
      {
        numero_cuenta: 'CA1000000002',
        id_socio: socios[1].id,
        tipo_cuenta: 'ahorro',
        saldo: 10000.00,
        tasa_interes: 2.5,
        moneda: 'HNL'
      },
      {
        numero_cuenta: 'CA1000000003',
        id_socio: socios[2].id,
        tipo_cuenta: 'corriente',
        saldo: 3000.00,
        tasa_interes: 0,
        moneda: 'HNL'
      }
    ]);

    console.log('✅ Cuentas creadas:', cuentas.length);

    console.log('\n✨ Base de datos inicializada correctamente!\n');
    console.log('📋 Credenciales de prueba:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   👤 Administrador:');
    console.log('      Usuario: admin');
    console.log('      Contraseña: admin123');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   👤 Cajero:');
    console.log('      Usuario: cajero1');
    console.log('      Contraseña: admin123');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   👤 Socio:');
    console.log('      Usuario: socio1');
    console.log('      Contraseña: admin123');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar script
inicializarDB();

// Script para crear usuarios iniciales de COOP-SMART
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/mysql');
const Usuario = require('../models/Usuario');

async function crearUsuarios() {
  try {
    console.log('🔐 Creando usuarios iniciales...\n');

    // Sincronizar modelo
    await Usuario.sync();

    // Verificar si ya existen usuarios
    const usuariosExistentes = await Usuario.count();
    if (usuariosExistentes > 0) {
      console.log('⚠️  Ya existen usuarios en la base de datos.');
      console.log('   Para reiniciar, elimina los registros de la tabla usuarios.\n');
      
      // Mostrar usuarios existentes
      const usuarios = await Usuario.findAll({
        attributes: ['id', 'nombre_usuario', 'email', 'rol', 'nombre_completo']
      });
      
      console.log('📋 Usuarios existentes:');
      usuarios.forEach(u => {
        console.log(`   ${u.id}. ${u.nombre_usuario} (${u.rol}) - ${u.email}`);
      });
      
      process.exit(0);
    }

    // Crear hash de la contraseña
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Crear usuarios
    const usuarios = [
      {
        nombre_usuario: 'admin',
        email: 'admin@coopsmart.com',
        contrasena_hash: passwordHash,
        rol: 'administrador',
        nombre_completo: 'Administrador del Sistema',
        activo: true
      },
      {
        nombre_usuario: 'cajero1',
        email: 'cajero1@coopsmart.com',
        contrasena_hash: passwordHash,
        rol: 'cajero',
        nombre_completo: 'María González',
        activo: true
      },
      {
        nombre_usuario: 'cajero2',
        email: 'cajero2@coopsmart.com',
        contrasena_hash: passwordHash,
        rol: 'cajero',
        nombre_completo: 'Carlos Martínez',
        activo: true
      },
      {
        nombre_usuario: 'socio1',
        email: 'socio1@coopsmart.com',
        contrasena_hash: passwordHash,
        rol: 'socio',
        nombre_completo: 'Juan Pérez',
        activo: true
      }
    ];

    // Insertar usuarios
    for (const usuarioData of usuarios) {
      const usuario = await Usuario.create(usuarioData);
      console.log(`✅ Usuario creado: ${usuario.nombre_usuario} (${usuario.rol})`);
    }

    console.log('\n🎉 ¡Usuarios creados exitosamente!\n');
    console.log('📋 Credenciales (todas tienen la misma contraseña):');
    console.log('   Usuario: admin    | Contraseña: admin123 | Rol: Administrador');
    console.log('   Usuario: cajero1  | Contraseña: admin123 | Rol: Cajero');
    console.log('   Usuario: cajero2  | Contraseña: admin123 | Rol: Cajero');
    console.log('   Usuario: socio1   | Contraseña: admin123 | Rol: Socio\n');
    console.log('🔐 IMPORTANTE: Cambia estas contraseñas en producción.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error.message);
    process.exit(1);
  }
}

crearUsuarios();

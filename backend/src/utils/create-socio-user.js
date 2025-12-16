/**
 * Script para crear un usuario socio de prueba para la app móvil
 */

const bcrypt = require('bcrypt');
const { Usuario, Socio } = require('./models');

async function crearUsuarioSocio() {
    try {
        console.log('🔍 Buscando socio existente...');
        
        // Buscar el primer socio activo
        const socio = await Socio.findOne({
            where: { estado: 'activo' }
        });
        
        if (!socio) {
            console.log('❌ No hay socios en la base de datos');
            return;
        }
        
        console.log(`✅ Socio encontrado: ${socio.nombre} ${socio.apellido} (${socio.email})`);
        
        // Verificar si ya existe un usuario con ese email
        const usuarioExistente = await Usuario.findOne({
            where: { email: socio.email }
        });
        
        if (usuarioExistente) {
            console.log('ℹ️  Ya existe un usuario con ese email:', usuarioExistente.nombre_usuario);
            console.log('📱 Puedes usar estas credenciales en la app móvil:');
            console.log(`   Usuario: ${usuarioExistente.nombre_usuario}`);
            console.log(`   Contraseña: (la que tenía configurada)`);
            process.exit(0);
        }
        
        // Crear usuario para el socio
        const passwordHash = await bcrypt.hash('123456', 10);
        
        const nuevoUsuario = await Usuario.create({
            nombre_usuario: 'socio1',
            nombre_completo: `${socio.nombre} ${socio.apellido}`,
            email: socio.email,
            contrasena_hash: passwordHash,
            rol: 'socio',
            activo: true
        });
        
        console.log('\n✅ Usuario socio creado exitosamente!');
        console.log('\n📱 Credenciales para la app móvil:');
        console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Usuario:    socio1`);
        console.log(`   Contraseña: 123456`);
        console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n   Socio: ${socio.nombre} ${socio.apellido}`);
        console.log(`   Email: ${socio.email}`);
        
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.log('\nℹ️  El usuario socio1 ya existe. Intenta iniciar sesión con:');
            console.log('   Usuario: socio1');
            console.log('   Contraseña: 123456');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
    
    process.exit(0);
}

crearUsuarioSocio();

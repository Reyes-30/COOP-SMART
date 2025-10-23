/**
 * Script para generar hash de contraseña con bcrypt
 */

const bcrypt = require('bcrypt');

// La contraseña que quieres usar
const password = 'Reyes2000';

// Generar hash (10 rounds de salt, igual que en el sistema)
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('❌ Error generando hash:', err);
        return;
    }
    
    console.log('\n✅ Hash generado exitosamente:\n');
    console.log('Contraseña original:', password);
    console.log('Hash encriptado:', hash);
    console.log('\n📋 Copia este hash y pégalo en la columna "contrasena_hash" de phpMyAdmin\n');
    
    // Verificar que el hash funciona
    bcrypt.compare(password, hash, (err, result) => {
        if (result) {
            console.log('✓ Verificación exitosa: El hash es válido\n');
        }
    });
});

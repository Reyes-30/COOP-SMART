/**
 * Script de inicio simplificado para debugging
 */

console.log('🚀 Iniciando servidor COOP-SMART...\n');

// Verificar Node.js
console.log('✓ Node.js versión:', process.version);

// Cargar variables de entorno
require('dotenv').config();
console.log('✓ Variables de entorno cargadas');
console.log('  - Puerto:', process.env.PORT || 3000);
console.log('  - Base de datos:', process.env.DB_NAME || 'coop_smart');
console.log('  - Usuario DB:', process.env.DB_USER || 'root');

// Intentar cargar dependencias
try {
    const express = require('express');
    console.log('✓ Express cargado');
    
    const mysql2 = require('mysql2');
    console.log('✓ MySQL2 cargado');
    
    const { Sequelize } = require('sequelize');
    console.log('✓ Sequelize cargado\n');
} catch (error) {
    console.error('❌ Error cargando dependencias:', error.message);
    console.error('\n💡 Ejecuta: npm install\n');
    process.exit(1);
}

// Intentar conectar a MySQL
console.log('📡 Probando conexión a MySQL...');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'coop_smart',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a MySQL exitosa\n');
        
        // Iniciar servidor Express
        const app = require('./src/app.js');
        console.log('✓ Aplicación iniciada correctamente\n');
        console.log('🌐 Servidor disponible en: http://localhost:' + (process.env.PORT || 3000));
        console.log('📝 Puedes cerrar esta ventana con Ctrl+C\n');
    })
    .catch(error => {
        console.error('❌ Error conectando a MySQL:');
        console.error('   Mensaje:', error.message);
        console.error('\n💡 Soluciones posibles:');
        console.error('   1. Verifica que XAMPP/MySQL esté corriendo');
        console.error('   2. Verifica el nombre de la base de datos: coop_smart');
        console.error('   3. Verifica el usuario y contraseña en .env');
        console.error('   4. Asegúrate que el puerto sea 3306\n');
        process.exit(1);
    });

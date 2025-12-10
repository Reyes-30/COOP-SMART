/**
 * Script para agregar columna numero_cuota a tabla pagos
 * Ejecutar: node src/migrations/add-numero-cuota.js
 */

const sequelize = require('../config/mysql');

async function agregarColumnaNumeroQuota() {
  try {
    console.log('🔧 Agregando columna numero_cuota a tabla pagos...');
    
    // Verificar si la columna ya existe
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'coop_smart' 
      AND TABLE_NAME = 'pagos' 
      AND COLUMN_NAME = 'numero_cuota'
    `);

    if (results.length > 0) {
      console.log('✅ La columna numero_cuota ya existe');
      process.exit(0);
    }

    // Agregar la columna
    await sequelize.query(`
      ALTER TABLE pagos 
      ADD COLUMN numero_cuota INT DEFAULT 1 
      AFTER id_prestamo
    `);

    console.log('✅ Columna numero_cuota agregada exitosamente');
    
    // Verificar que se agregó
    const [verify] = await sequelize.query(`
      DESCRIBE pagos
    `);
    
    console.log('\n📋 Estructura actualizada de tabla pagos:');
    console.table(verify);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar columna:', error);
    process.exit(1);
  }
}

agregarColumnaNumeroQuota();

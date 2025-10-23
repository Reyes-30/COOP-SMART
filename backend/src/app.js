/**
 * COOP-SMART Backend API
 * Sistema de gestión para cooperativas de ahorro y crédito
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// Middlewares de seguridad y optimización
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: '*', // Permitir todas las conexiones en desarrollo
  credentials: false
}));

// Middlewares de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rutas principales
app.get('/', (req, res) => {
  res.json({
    message: '🏦 Bienvenido a COOP-SMART API',
    version: process.env.APP_VERSION || '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const sociosRoutes = require('./routes/socios.routes');
const clientesRoutes = require('./routes/clientes.routes');
const cuentasRoutes = require('./routes/cuentas.routes');
const prestamosRoutes = require('./routes/prestamos.routes');
const pagosRoutes = require('./routes/pagos.routes');
const reportesRoutes = require('./routes/reportes.routes');
const logsRoutes = require('./routes/logs.routes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/socios', sociosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/logs', logsRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║     🏦 COOP-SMART API Server          ║
  ╠════════════════════════════════════════╣
  ║  Puerto: ${PORT}                          ║
  ║  Entorno: ${process.env.NODE_ENV || 'development'}              ║
  ║  URL: http://localhost:${PORT}            ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;

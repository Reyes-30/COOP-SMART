/**
 * Rutas de Autenticación
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.get('/perfil', verificarToken, authController.perfil);
router.put('/cambiar-contrasena', verificarToken, authController.cambiarContrasena);

module.exports = router;

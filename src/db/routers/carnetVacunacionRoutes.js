
const express = require('express');
const router = express.Router();

const carnetVacunacionController = require('../controllers/carnetVacunacionController');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Consultar el carnet mediante un token público aleatorio.
// Este endpoint no requiere iniciar sesión.
router.get('/publico/:token', carnetVacunacionController.consultarPublico);

// Obtener o crear el carnet de una mascota.
// Requiere autenticación y verifica los permisos en el servicio.
router.get('/mascota/:mascotaId', authenticateToken, carnetVacunacionController.obtenerOCrear);

module.exports = router;

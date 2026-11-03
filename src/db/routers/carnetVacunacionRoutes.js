
const express = require('express');
const router = express.Router();

const carnetVacunacionController = require('../controllers/carnetVacunacionController');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.get('/publico/:token', carnetVacunacionController.consultarPublico);

router.get('/mascota/:mascotaId', authenticateToken, carnetVacunacionController.obtenerOCrear);

module.exports = router;

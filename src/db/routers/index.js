const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const mascotaRoutes = require('./mascotaRoutes');
const turnoRoutes = require('./turnoRoutes');

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/mascotas', mascotaRoutes);
router.use('/turnos', turnoRoutes);

module.exports = router;


const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const mascotaRoutes = require('./mascotaRoutes');
const turnoRoutes = require('./turnoRoutes');
const registroSanitarioRoutes = require('./registroSanitarioRoutes');
const archivoMedicoRoutes = require('./archivoMedicoRoutes');
const consultaRoutes = require('./consultaRoutes');
const prescripcionRoutes = require('./prescripcionRoutes');
const triageRoutes = require('./triageRoutes');
const recetaRoutes = require('./recetaRoutes');

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/mascotas', mascotaRoutes);
router.use('/registroSanitario', registroSanitarioRoutes);
router.use('/turnos', turnoRoutes);
router.use('/archivos-medicos', archivoMedicoRoutes);
router.use('/consultas', consultaRoutes);
router.use('/prescripcion', prescripcionRoutes);
router.use('/triage', triageRoutes);
router.use('/recetas', recetaRoutes);

module.exports = router;

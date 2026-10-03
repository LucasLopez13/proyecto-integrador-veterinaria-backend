const express = require('express');
const router = express.Router();

const archivoMedicoController = require('../controllers/archivoMedicoController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const uploadArchivoMedico = require('../middlewares/uploadArchivoMedico');

// Listar todos los archivos médicos del usuario
router.get(
  '/',
  authenticateToken,
  archivoMedicoController.getAll
);

// Listar archivos médicos de una mascota
router.get(
  '/mascota/:mascotaId',
  authenticateToken,
  archivoMedicoController.getByMascota
);

// Visualizar el archivo físico
router.get(
  '/:id/archivo',
  authenticateToken,
  archivoMedicoController.getFile
);

// Consultar información de un archivo médico
router.get(
  '/:id',
  authenticateToken,
  archivoMedicoController.getById
);

// Subir un archivo médico
router.post(
  '/',
  authenticateToken,
  uploadArchivoMedico.single('archivo'),
  archivoMedicoController.create
);

// Eliminar un archivo médico
router.delete(
  '/:id',
  authenticateToken,
  archivoMedicoController.delete
);

module.exports = router;
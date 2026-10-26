const express = require('express');
const router = express.Router();
const archivoMedicoController = require('../controllers/archivoMedicoController');
const { authenticateToken, hasRole } = require('../middlewares/auth.middleware');
const uploadArchivoMedico = require('../middlewares/uploadArchivoMedico');

router.get(
  '/',
  authenticateToken,
  archivoMedicoController.getAll
);

router.get(
  '/mascota/:mascotaId',
  authenticateToken,
  archivoMedicoController.getByMascota
);

router.get(
  '/:id/archivo',
  authenticateToken,
  archivoMedicoController.getFile
);

router.get(
  '/:id',
  authenticateToken,
  archivoMedicoController.getById
);

router.post(
  '/',
  authenticateToken,
  hasRole('profesional', 'admin'),
  uploadArchivoMedico.single('archivo'),
  archivoMedicoController.create
);

router.delete(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  archivoMedicoController.delete
);

module.exports = router;
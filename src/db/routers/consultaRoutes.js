const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const schemaValidator = require('../middlewares/schemaValidator');
const { authenticateToken, hasRole } = require('../middlewares/auth.middleware');
const {
  consultaCreateSchema,
  consultaUpdateSchema,
  consultaAnulacionSchema
} = require('../schema/consultaSchema');

// Crear consulta SOAP inicial (Versión 1)
router.post(
  '/',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(consultaCreateSchema),
  consultaController.create
);

// Enmendar/modificar consulta existente (crea una nueva versión histórica inmutable)
router.put(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(consultaUpdateSchema),
  consultaController.update
);

// Consultar historial de versiones y auditoría legal de una consulta
router.get(
  '/:id/versiones',
  authenticateToken,
  consultaController.getVersiones
);

// Anulación lógica de consulta médica (soft delete con registro en auditoría, sin borrado físico)
router.delete(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(consultaAnulacionSchema),
  consultaController.delete
);

// Listar todas las consultas
router.get(
  '/',
  authenticateToken,
  hasRole('profesional', 'admin'),
  consultaController.getAll
);

// Listar consultas de una mascota
router.get(
  '/mascota/:mascotaId',
  authenticateToken,
  consultaController.getByMascotaId
);

// Detalle de una consulta
router.get(
  '/:id',
  authenticateToken,
  consultaController.getById
);

module.exports = router;

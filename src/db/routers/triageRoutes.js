const express = require('express');
const router = express.Router();
const triageController = require('../controllers/triageController');
const schemaValidator = require('../middlewares/schemaValidator');
const { authenticateToken, hasRole } = require('../middlewares/auth.middleware');
const {
  triageCreateSchema,
  triageMoverSchema,
  triageUpdateSchema
} = require('../schema/triageSchema');

// Obtener tablero Kanban de guardia / triage
router.get(
  '/',
  authenticateToken,
  hasRole('profesional', 'admin'),
  triageController.getKanban
);

// Detalle de un ingreso
router.get(
  '/:id',
  authenticateToken,
  triageController.getById
);

// Ingresar paciente al triage de guardia
router.post(
  '/',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(triageCreateSchema),
  triageController.create
);

// Mover tarjeta entre columnas en el Kanban
router.put(
  '/:id/mover',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(triageMoverSchema),
  triageController.mover
);

// Actualizar datos del triage
router.put(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(triageUpdateSchema),
  triageController.update
);

// Finalizar / dar de alta paciente de la guardia
router.delete(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  triageController.finalizar
);

module.exports = router;

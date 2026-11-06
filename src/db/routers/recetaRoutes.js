const express = require('express');
const recetaController = require('../controllers/recetaController');
const schemaValidator = require('../middlewares/schemaValidator');

const {
  authenticateToken,
  hasRole
} = require('../middlewares/auth.middleware');

const {
  recetaCreateSchema,
  recetaUpdateSchema
} = require('../schema/recetaSchema');

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  hasRole('cliente', 'profesional', 'admin'),
  recetaController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  hasRole('cliente', 'profesional', 'admin'),
  recetaController.getById
);

router.post(
  '/',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(recetaCreateSchema),
  recetaController.create
);

router.put(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(recetaUpdateSchema),
  recetaController.update
);

router.delete(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  recetaController.remove
);

module.exports = router;
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

router.get(
  '/',
  authenticateToken,
  hasRole('profesional', 'admin'),
  triageController.getKanban
);


router.get(
  '/:id',
  authenticateToken,
  triageController.getById
);


router.post(
  '/',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(triageCreateSchema),
  triageController.create
);


router.put(
  '/:id/mover',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(triageMoverSchema),
  triageController.mover
);


router.put(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  schemaValidator(triageUpdateSchema),
  triageController.update
);


router.delete(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  triageController.finalizar
);

module.exports = router;

const express = require('express');
const recetaController = require('../controllers/recetaController');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  requireRole('cliente'),
  recetaController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  requireRole('cliente'),
  recetaController.getById
);

router.post(
  '/',
  authenticateToken,
  requireRole('profesional'),
  recetaController.create
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('profesional'),
  recetaController.update
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('profesional'),
  recetaController.remove
);

module.exports = router;
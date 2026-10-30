const express = require('express');
const recetaController = require('../controllers/recetaController');
const { authenticateToken, hasRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  hasRole('cliente'),
  recetaController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  hasRole('cliente'),
  recetaController.getById
);

router.post(
  '/',
  authenticateToken,
  hasRole('profesional', 'admin'),
  recetaController.create
);

router.put(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  recetaController.update
);

router.delete(
  '/:id',
  authenticateToken,
  hasRole('profesional', 'admin'),
  recetaController.remove
);

module.exports = router;
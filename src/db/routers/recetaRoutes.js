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
  requireRole('veterinario'),
  recetaController.create
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('veterinario'),
  recetaController.update
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('veterinario'),
  recetaController.remove
);

module.exports = router;
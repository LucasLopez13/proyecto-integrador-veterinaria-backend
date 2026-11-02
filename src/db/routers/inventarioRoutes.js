const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { authenticateToken, hasRole } = require('../middlewares/auth.middleware');

router.get(
  '/productos-lotes',
  authenticateToken,
  hasRole('profesional', 'admin'),
  inventarioController.getProductosConLotes
);

router.post(
  '/consumo',
  authenticateToken,
  hasRole('profesional', 'admin'),
  inventarioController.registrarConsumo
);

router.get(
  '/consulta/:consultaId',
  authenticateToken,
  inventarioController.getMovimientosByConsulta
);

router.get(
  '/movimientos',
  authenticateToken,
  hasRole('profesional', 'admin'),
  inventarioController.getHistorialMovimientos
);

module.exports = router;

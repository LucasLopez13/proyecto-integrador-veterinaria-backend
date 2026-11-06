const express = require('express');
const router = express.Router();

const facturacionController = require('../controllers/facturacionController');

const {
  authenticateToken,
  hasRole
} = require('../middlewares/auth.middleware');

router.get(
  '/servicios',
  authenticateToken,
  hasRole('profesional', 'admin', 'recepcion'),
  facturacionController.listarServicios
);

router.post(
  '/servicios',
  authenticateToken,
  hasRole('admin', 'profesional'),
  facturacionController.crearServicio
);

router.put(
  '/servicios/:id',
  authenticateToken,
  hasRole('admin', 'profesional'),
  facturacionController.actualizarServicio
);

router.patch(
  '/servicios/:id/estado',
  authenticateToken,
  hasRole('admin', 'profesional'),
  facturacionController.cambiarEstadoServicio
);

router.get(
  '/productos',
  authenticateToken,
  hasRole('profesional', 'admin', 'recepcion'),
  facturacionController.listarProductos
);

router.get(
  '/mis-ordenes',
  authenticateToken,
  hasRole('cliente', 'profesional', 'recepcion', 'admin'),
  facturacionController.listarMisOrdenes
);

router.get(
  '/ordenes',
  authenticateToken,
  hasRole('profesional', 'recepcion', 'admin'),
  facturacionController.listarOrdenes
);

router.get(
  '/ordenes/:id',
  authenticateToken,
  hasRole('profesional', 'recepcion', 'admin'),
  facturacionController.obtenerOrden
);

router.patch(
  '/ordenes/:id/estado',
  authenticateToken,
  hasRole('profesional', 'recepcion', 'admin'),
  facturacionController.actualizarEstadoOrden
);

router.post(
  '/ordenes/:id/pagar',
  authenticateToken,
  hasRole('cliente', 'profesional', 'recepcion', 'admin'),
  facturacionController.pagarOrden
);

router.get(
  '/consultas-pendientes',
  authenticateToken,
  hasRole('profesional', 'recepcion', 'admin'),
  facturacionController.listarConsultasPendientes
);

router.get(
  '/consultas/:consultaId/conceptos',
  authenticateToken,
  hasRole('profesional', 'admin', 'recepcion'),
  facturacionController.listarConceptos
);

router.post(
  '/consultas/:consultaId/conceptos',
  authenticateToken,
  hasRole('profesional', 'admin', 'recepcion'),
  facturacionController.agregarConcepto
);

router.delete(
  '/consultas/:consultaId/conceptos/:conceptoId',
  authenticateToken,
  hasRole('profesional', 'admin', 'recepcion'),
  facturacionController.eliminarConcepto
);

router.post(
  '/consultas/:consultaId/orden-facturacion',
  authenticateToken,
  hasRole('profesional', 'recepcion', 'admin'),
  facturacionController.generarOrden
);

module.exports = router;

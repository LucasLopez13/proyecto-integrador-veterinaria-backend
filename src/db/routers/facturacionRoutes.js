
const express = require('express');
const router = express.Router();

const facturacionController = require('../controllers/facturacionController');

const {
  authenticateToken,
  hasRole
} = require('../middlewares/auth.middleware');

// ==========================================
// CATÁLOGO DE SERVICIOS
// ==========================================

// Listar servicios disponibles
router.get(
  '/servicios',
  authenticateToken,
  hasRole('profesional', 'admin', 'recepcion'),
  facturacionController.listarServicios
);

// Crear servicio: solamente administrador
router.post(
  '/servicios',
  authenticateToken,
  hasRole('admin'),
  facturacionController.crearServicio
);

// Actualizar servicio: solamente administrador
router.put(
  '/servicios/:id',
  authenticateToken,
  hasRole('admin'),
  facturacionController.actualizarServicio
);

// Activar o desactivar servicio: solamente administrador
router.patch(
  '/servicios/:id/estado',
  authenticateToken,
  hasRole('admin'),
  facturacionController.cambiarEstadoServicio
);

// Listar productos disponibles para facturación
router.get(
  '/productos',
  authenticateToken,
  hasRole('profesional', 'admin', 'recepcion'),
  facturacionController.listarProductos
);

// ==========================================
// ORDENES DE FACTURACION
// ==========================================

// Listar todas las órdenes
router.get(
  '/ordenes',
  authenticateToken,
  hasRole('recepcion', 'admin'),
  facturacionController.listarOrdenes
);

// Obtener una orden por ID
router.get(
  '/ordenes/:id',
  authenticateToken,
  hasRole('recepcion', 'admin'),
  facturacionController.obtenerOrden
);

// Consultas pendientes de facturación
router.get(
  '/consultas-pendientes',
  authenticateToken,
  hasRole('recepcion', 'admin'),
  facturacionController.listarConsultasPendientes
);

// ==========================================
// CONCEPTOS DE CONSULTA
// ==========================================

// Consultar conceptos
router.get(
  '/consultas/:consultaId/conceptos',
  authenticateToken,
  hasRole('profesional', 'admin', 'recepcion'),
  facturacionController.listarConceptos
);

// Agregar concepto: veterinario o administrador
router.post(
  '/consultas/:consultaId/conceptos',
  authenticateToken,
  hasRole('profesional', 'admin'),
  facturacionController.agregarConcepto
);

// Eliminar concepto: veterinario o administrador
router.delete(
  '/consultas/:consultaId/conceptos/:conceptoId',
  authenticateToken,
  hasRole('profesional', 'admin'),
  facturacionController.eliminarConcepto
);

// ==========================================
// ORDEN DE FACTURACIÓN
// ==========================================

// Generar orden: recepción o administrador
router.post(
  '/consultas/:consultaId/orden-facturacion',
  authenticateToken,
  hasRole('recepcion', 'admin'),
  facturacionController.generarOrden
);

module.exports = router;

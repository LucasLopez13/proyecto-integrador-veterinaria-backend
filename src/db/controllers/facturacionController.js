const facturacionService = require('../services/facturacionService');

const facturacionController = {
  listarServicios: async (req, res, next) => {
    try {
      const incluirInactivos = req.query.incluirInactivos === 'true';

      const servicios = await facturacionService.listarServicios(
        incluirInactivos
      );

      res.json(servicios);
    } catch (error) {
      next(error);
    }
  },

  listarProductos: async (req, res, next) => {
    try {
      const productos = await facturacionService.listarProductos();

      res.json(productos);
    } catch (error) {
      next(error);
    }
  },

  crearServicio: async (req, res, next) => {
    try {
      const servicio = await facturacionService.crearServicio(req.body);

      res.status(201).json({
        message: 'Servicio creado correctamente',
        servicio
      });
    } catch (error) {
      next(error);
    }
  },

  actualizarServicio: async (req, res, next) => {
    try {
      const servicio = await facturacionService.actualizarServicio(
        req.params.id,
        req.body
      );

      res.json({
        message: 'Servicio actualizado correctamente',
        servicio
      });
    } catch (error) {
      next(error);
    }
  },

  cambiarEstadoServicio: async (req, res, next) => {
    try {
      const servicio = await facturacionService.cambiarEstadoServicio(
        req.params.id,
        req.body.activo
      );

      res.json({
        message: 'Estado del servicio actualizado',
        servicio
      });
    } catch (error) {
      next(error);
    }
  },

  agregarConcepto: async (req, res, next) => {
    try {
      const concepto = await facturacionService.agregarConceptoConsulta(
        req.params.consultaId,
        req.body,
        req.user
      );

      res.status(201).json({
        message: 'Concepto agregado correctamente',
        concepto
      });
    } catch (error) {
      next(error);
    }
  },

  listarConceptos: async (req, res, next) => {
    try {
      const conceptos = await facturacionService.listarConceptosConsulta(
        req.params.consultaId,
        req.user
      );

      res.json(conceptos);
    } catch (error) {
      next(error);
    }
  },

  eliminarConcepto: async (req, res, next) => {
    try {
      const resultado = await facturacionService.eliminarConceptoConsulta(
        req.params.consultaId,
        req.params.conceptoId,
        req.user
      );

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  listarOrdenes: async (req, res, next) => {
    try {
      const ordenes = await facturacionService.listarOrdenesFacturacion();

      res.json(ordenes);
    } catch (error) {
      next(error);
    }
  },

  listarMisOrdenes: async (req, res, next) => {
    try {
      const ordenes = await facturacionService.listarOrdenesCliente(req.user);

      res.json(ordenes);
    } catch (error) {
      next(error);
    }
  },

  obtenerOrden: async (req, res, next) => {
    try {
      const orden = await facturacionService.obtenerOrdenFacturacion(
        req.params.id
      );

      res.json(orden);
    } catch (error) {
      next(error);
    }
  },

  actualizarEstadoOrden: async (req, res, next) => {
    try {
      const orden = await facturacionService.actualizarEstadoOrden(
        req.params.id,
        req.body.estado,
        req.user
      );

      res.json({
        message: `El estado de la orden #${orden.id} se actualizo a ${orden.estado}`,
        orden
      });
    } catch (error) {
      next(error);
    }
  },

  listarConsultasPendientes: async (req, res, next) => {
    try {
      const consultas =
        await facturacionService.listarConsultasPendientesFacturacion();

      res.json(consultas);
    } catch (error) {
      next(error);
    }
  },

  generarOrden: async (req, res, next) => {
    try {
      const orden = await facturacionService.generarOrdenFacturacion(
        req.params.consultaId,
        req.user
      );

      res.status(201).json({
        message: 'Orden de facturacion generada correctamente',
        orden
      });
    } catch (error) {
      next(error);
    }
  },

  pagarOrden: async (req, res, next) => {
    try {
      const orden = await facturacionService.pagarOrden(
        req.params.id,
        req.body,
        req.user
      );

      res.json({
        message: `La orden #${orden.id} fue abonada exitosamente`,
        orden
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = facturacionController;

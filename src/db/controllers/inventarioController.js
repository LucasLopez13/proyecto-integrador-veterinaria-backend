const inventarioService = require('../services/inventarioService');

const inventarioController = {
  getProductosConLotes: async (req, res, next) => {
    try {
      const productos = await inventarioService.getProductosConLotes();
      res.status(200).json(productos);
    } catch (error) {
      next(error);
    }
  },

  registrarConsumo: async (req, res, next) => {
    try {
      const resultado = await inventarioService.registrarConsumo(req.body, req.user);
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  },

  getMovimientosByConsulta: async (req, res, next) => {
    try {
      const movimientos = await inventarioService.getMovimientosByConsulta(req.params.consultaId);
      res.status(200).json(movimientos);
    } catch (error) {
      next(error);
    }
  },

  getHistorialMovimientos: async (req, res, next) => {
    try {
      const limite = req.query.limite ? Number(req.query.limite) : 50;
      const movimientos = await inventarioService.getHistorialMovimientos(limite);
      res.status(200).json(movimientos);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = inventarioController;

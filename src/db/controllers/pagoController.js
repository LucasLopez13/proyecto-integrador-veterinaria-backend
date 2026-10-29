const pagoService = require('../services/pagoService');

const pagoController = {
  getAll: async (req, res, next) => {
    try {
      const pagos = await pagoService.getAll(req.user);
      res.status(200).json(pagos);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const pago = await pagoService.getById(
        Number(req.params.id),
        req.user
      );
      res.status(200).json(pago);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const pago = await pagoService.create(req.body, req.user);
      res.status(201).json(pago);
    } catch (error) {
      next(error);
    }
  },

  updateEstado: async (req, res, next) => {
    try {
      const pago = await pagoService.updateEstado(
        Number(req.params.id),
        req.body.estado,
        req.user
      );
      res.status(200).json(pago);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = pagoController;

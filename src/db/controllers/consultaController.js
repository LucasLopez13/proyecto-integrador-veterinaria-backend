const consultaService = require('../services/consultaService');

const consultaController = {
  create: async (req, res, next) => {
    try {
      const consulta = await consultaService.create(req.body, req.user);
      res.status(201).json(consulta);
    } catch (error) {
      next(error);
    }
  },

  getByMascotaId: async (req, res, next) => {
    try {
      const consultas = await consultaService.getByMascotaId(req.params.mascotaId, req.user);
      res.status(200).json(consultas);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const consulta = await consultaService.getById(req.params.id, req.user);
      res.status(200).json(consulta);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const consultas = await consultaService.getAll(req.user);
      res.status(200).json(consultas);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = consultaController;

const turnoService = require('../services/turnoService');

const turnoController = {
  getAll: async (req, res, next) => {
    try {
      const turnos = await turnoService.getAll(req.user);
      res.status(200).json(turnos);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const turno = await turnoService.getById(req.params.id, req.user);
      res.status(200).json(turno);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const turno = await turnoService.create(req.body, req.user);
      res.status(201).json(turno);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const turno = await turnoService.update(req.params.id, req.user, req.body);
      res.status(200).json(turno);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const resultado = await turnoService.delete(req.params.id, req.user);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = turnoController;
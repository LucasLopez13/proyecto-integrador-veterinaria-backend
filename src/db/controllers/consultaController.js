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

  update: async (req, res, next) => {
    try {
      const consulta = await consultaService.update(req.params.id, req.body, req.user);
      res.status(200).json(consulta);
    } catch (error) {
      next(error);
    }
  },

  getVersiones: async (req, res, next) => {
    try {
      const versiones = await consultaService.getVersiones(req.params.id, req.user);
      res.status(200).json(versiones);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const motivoAnulacion = req.body?.motivoAnulacion || req.query?.motivoAnulacion;
      const resultado = await consultaService.delete(req.params.id, motivoAnulacion, req.user);
      res.status(200).json(resultado);
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

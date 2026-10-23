const triageService = require('../services/triageService');

const triageController = {
  getKanban: async (req, res, next) => {
    try {
      const items = await triageService.getKanban();
      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const item = await triageService.getById(req.params.id);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const nuevoItem = await triageService.create(req.body, req.user);
      res.status(201).json(nuevoItem);
    } catch (error) {
      next(error);
    }
  },

  mover: async (req, res, next) => {
    try {
      const { columna } = req.body;
      const itemActualizado = await triageService.mover(req.params.id, columna);
      res.status(200).json(itemActualizado);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const itemActualizado = await triageService.update(req.params.id, req.body);
      res.status(200).json(itemActualizado);
    } catch (error) {
      next(error);
    }
  },

  finalizar: async (req, res, next) => {
    try {
      const resultado = await triageService.finalizar(req.params.id);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = triageController;

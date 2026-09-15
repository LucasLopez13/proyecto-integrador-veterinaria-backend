const usuarioService = require('../services/usuarioService');

const usuarioController = {
  getAll: async (req, res, next) => {
    try {
      const usuarios = await usuarioService.getAll();
      res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const usuario = await usuarioService.getById(req.params.id);
      res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const usuario = await usuarioService.create(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const usuario = await usuarioService.update(req.params.id, req.body);
      res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const result = await usuarioService.delete(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = usuarioController;

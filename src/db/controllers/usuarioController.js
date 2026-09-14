const db = require('../models');
const { Usuario } = db;

const usuarioController = {
  getAll: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: getAll usuarios' });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: getById usuario' });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: create usuario' });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: update usuario' });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: delete usuario' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = usuarioController;

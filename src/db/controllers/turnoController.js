const db = require('../models');
const { Turno } = db;

const turnoController = {
  getAll: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: getAll turnos' });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: getById turno' });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: create turno' });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: update turno' });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: delete turno' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = turnoController;

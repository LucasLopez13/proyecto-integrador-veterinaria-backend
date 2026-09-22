const db = require('../models');
const { Mascota } = db;

const mascotaController = {
  getAll: async (req, res, next) => {
  try {
    const mascotas = await Mascota.findAll();

    res.status(200).json(mascotas);
  } catch (error) {
    next(error);
  }
},

  getById: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: getById mascota' });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: create mascota' });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: update mascota' });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      res.status(501).json({ message: 'No implementado: delete mascota' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = mascotaController;

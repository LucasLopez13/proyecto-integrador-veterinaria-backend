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
      const mascota = await Mascota.findByPk(req.params.id);

      if (!mascota) {
        return res.status(404).json({
          message: 'Mascota no encontrada'
        });
      }

      res.status(200).json(mascota);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const mascota = await Mascota.create(req.body);

      res.status(201).json(mascota);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const mascota = await Mascota.findByPk(req.params.id);

      if (!mascota) {
        return res.status(404).json({
          message: 'Mascota no encontrada'
        });
      }

      await mascota.update(req.body);

      res.status(200).json(mascota);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const mascota = await Mascota.findByPk(req.params.id);

      if (!mascota) {
        return res.status(404).json({
          message: 'Mascota no encontrada'
        });
      }

      await mascota.destroy();

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = mascotaController;
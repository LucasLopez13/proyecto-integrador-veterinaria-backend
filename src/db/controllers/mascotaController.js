const db = require('../models');
const { Mascota } = db;
const mascotaService = require('../services/mascotaService');

const mascotaController = {
  getAll: async (req, res, next) => {
    try {
        const mascotas = await mascotaService.getAll(req.user.id);
        res.status(200).json(mascotas);
    } catch (error) {
        next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
        const mascota = await mascotaService.getById(
            req.params.id,
            req.user.id
        );

        res.status(200).json(mascota);
    } catch (error) {
        next(error);
    }
  },

  create: async (req, res, next) => {
    try {
        const mascota = await mascotaService.create(
          req.body,
          req.user.id
        );

            res.status(201).json(mascota);
        } catch (error) {
            next(error);
        }
  },

  update: async (req, res, next) => {
    try {
        const mascota = await mascotaService.update(
            req.params.id,
            req.user.id,
            req.body
        );

        res.status(200).json(mascota);
    } catch (error) {
        next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
        const resultado = await mascotaService.delete(
            req.params.id,
            req.user.id
        );

        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
  }
};

module.exports = mascotaController;


const carnetVacunacionService = require('../services/carnetVacunacionService');

const carnetVacunacionController = {
  obtenerOCrear: async (req, res, next) => {
    try {
      const carnet = await carnetVacunacionService.obtenerOCrear(
        req.params.mascotaId,
        req.user
      );

      res.status(200).json(carnet);
    } catch (error) {
      next(error);
    }
  },

  consultarPublico: async (req, res, next) => {
    try {
      const carnet = await carnetVacunacionService.consultarPublico(
        req.params.token
      );

      res.status(200).json(carnet);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = carnetVacunacionController;

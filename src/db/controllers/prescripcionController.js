
const prescripcionService = require('../services/prescripcionService');

const prescripcionController = {
  create: async (req, res, next) => {
    try {
      const datos = {...req.body,consultaId: Number(req.params.consultaId)};
      const prescripcion = await prescripcionService.create( datos,req.user);
      res.status(201).json(prescripcion);
    } catch (error) {
      next(error);
    }
  },

  getByConsultaId: async (req, res, next) => {
    try {
      const consultaId = Number(req.params.consultaId);
      const prescripciones = await prescripcionService.getByConsultaId(consultaId,req.user);
      res.status(200).json(prescripciones);
    } catch (error) {
      next(error);
    }
  },

  confirm: async (req, res, next) => {
    try {
      const prescripcionId = Number(req.params.id);
      const prescripcion = await prescripcionService.confirm(prescripcionId,req.user);
      res.status(200).json({mensaje: 'Prescripción confirmada correctamente.',prescripcion});
    } catch (error) {
      next(error);
    }
  }
};

module.exports = prescripcionController;

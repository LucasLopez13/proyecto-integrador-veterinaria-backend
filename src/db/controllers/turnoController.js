const db = require('../models');
const { Turno } = db;

const turnoController = {
  // Obtener todos los turnos
  getAll: async (req, res, next) => {
    try {
      const turnos = await Turno.findAll();

      res.status(200).json(turnos);
    } catch (error) {
      next(error);
    }
  },

  // Obtener un turno por ID
  getById: async (req, res, next) => {
    try {
      const turno = await Turno.findByPk(req.params.id);

      if (!turno) {
        return res.status(404).json({
          message: 'Turno no encontrado'
        });
      }

      res.status(200).json(turno);
    } catch (error) {
      next(error);
    }
  },

  // Crear un turno
  create: async (req, res, next) => {
  try {
    console.log('BODY RECIBIDO:', req.body);

    const turno = await Turno.create(req.body);

    res.status(201).json(turno);
  } catch (error) {
    next(error);
  }
},

  // Modificar un turno
  update: async (req, res, next) => {
    try {
      const turno = await Turno.findByPk(req.params.id);

      if (!turno) {
        return res.status(404).json({
          message: 'Turno no encontrado'
        });
      }

      await turno.update(req.body);

      res.status(200).json(turno);
    } catch (error) {
      next(error);
    }
  },

  // Eliminar un turno
  delete: async (req, res, next) => {
    try {
      const turno = await Turno.findByPk(req.params.id);

      if (!turno) {
        return res.status(404).json({
          message: 'Turno no encontrado'
        });
      }

      await turno.destroy();

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = turnoController;
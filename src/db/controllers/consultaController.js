const db = require('../models');
const { Consulta } = db;

const consultaController = {
  getByMascota: async (req, res, next) => {
    try {
      const consultas = await Consulta.findAll({
        where: {
          mascotaId: req.params.id
        },
        include: [
          {
            association: 'profesional',
            attributes: ['id', 'nombre', 'apellido']
          }
        ],
        order: [['fecha', 'DESC']]
      });

      res.status(200).json(consultas);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = consultaController;
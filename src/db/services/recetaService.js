const { Receta, Mascota, Usuario } = require('../models');

const getAll = async (usuarioId) => {
  return await Receta.findAll({
    include: [
      {
        model: Mascota,
        as: 'mascota',
        where: {
          usuarioId
        }
      },
      {
        model: Usuario,
        as: 'profesional',
        attributes: ['id', 'nombre', 'apellido', 'email']
      }
    ],
    order: [['fecha', 'DESC']]
  });
};

const getById = async (id, usuarioId) => {
  return await Receta.findOne({
    where: {
      id
    },
    include: [
      {
        model: Mascota,
        as: 'mascota',
        where: {
          usuarioId
        }
      },
      {
        model: Usuario,
        as: 'profesional',
        attributes: ['id', 'nombre', 'apellido', 'email']
      }
    ]
  });
};

const create = async (data) => {
  return await Receta.create(data);
};

const update = async (id, data) => {
  const receta = await Receta.findByPk(id);

  if (!receta) {
    return null;
  }

  await receta.update(data);

  return receta;
};

const remove = async (id) => {
  const receta = await Receta.findByPk(id);

  if (!receta) {
    return null;
  }

  await receta.destroy();

  return receta;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};

const { Receta, Mascota, Usuario } = require('../models');

const incluirRelaciones = [
  {
    model: Mascota,
    as: 'mascota'
  },
  {
    model: Usuario,
    as: 'profesional',
    attributes: ['id', 'nombre', 'apellido', 'email']
  }
];

const getAll = async (usuarioId) => {
  return Receta.findAll({
    include: [
      {
        model: Mascota,
        as: 'mascota',
        where: { usuarioId }
      },
      incluirRelaciones[1]
    ],
    order: [['fecha', 'DESC']]
  });
};

const getById = async (id, usuarioId) => {
  return Receta.findOne({
    where: { id },
    include: [
      {
        model: Mascota,
        as: 'mascota',
        where: { usuarioId }
      },
      incluirRelaciones[1]
    ]
  });
};

const create = async (data, profesionalId) => {
  const mascota = await Mascota.findByPk(data.mascotaId);

  if (!mascota) {
    return null;
  }

  return Receta.create({
    ...data,
    profesionalId
  });
};

const update = async (id, data, profesionalId) => {
  const receta = await Receta.findOne({
    where: { id, profesionalId }
  });

  if (!receta) {
    return null;
  }

  const camposPermitidos = [
    'fecha',
    'medicamento',
    'indicaciones',
    'estado'
  ];

  const cambios = Object.fromEntries(
    Object.entries(data).filter(([campo]) =>
      camposPermitidos.includes(campo)
    )
  );

  await receta.update(cambios);

  return receta;
};

const remove = async (id, profesionalId) => {
  const receta = await Receta.findOne({
    where: { id, profesionalId }
  });

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

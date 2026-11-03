const db = require('../models');
const { Receta, Consulta, Mascota, Usuario, Producto } = db;

const {
  NotFoundError,
  ForbiddenError
} = require('../utils/customErrors');

const obtenerRol = (usuario) =>
  String(usuario.rol?.nombre || usuario.rol || '').toUpperCase();

const incluirRelaciones = [
  {
    model: Consulta,
    as: 'consulta',
    include: [
      { model: Mascota, as: 'mascota' },
      {
        model: Usuario,
        as: 'veterinario',
        attributes: ['id', 'nombre', 'apellido', 'email']
      }
    ]
  },
  { model: Producto, as: 'producto' }
];

const verificarAcceso = async (consulta, usuario) => {
  const rol = obtenerRol(usuario);

  if (rol === 'ADMIN') return;

  if (rol === 'PROFESIONAL') {
    if (consulta.veterinarioId !== usuario.id) {
      throw new ForbiddenError(
        'Solo el profesional responsable de la consulta puede acceder a esta receta'
      );
    }
    return;
  }

  if (rol === 'CLIENTE') {
    const mascota = await Mascota.findByPk(consulta.mascotaId);

    if (!mascota || mascota.usuarioId !== usuario.id) {
      throw new ForbiddenError(
        'No tienes permisos para acceder a esta receta'
      );
    }
    return;
  }

  throw new ForbiddenError('No tienes permisos para acceder a esta receta');
};

const getAll = async (usuario) => {
  const rol = obtenerRol(usuario);
  const whereConsulta = {};

  if (rol === 'PROFESIONAL') {
    whereConsulta.veterinarioId = usuario.id;
  }

  const recetas = await Receta.findAll({
    include: [
      {
        model: Consulta,
        as: 'consulta',
        where: whereConsulta,
        include: [{ model: Mascota, as: 'mascota' }]
      },
      { model: Producto, as: 'producto' }
    ],
    order: [['createdAt', 'DESC']]
  });

  if (rol === 'CLIENTE') {
    const recetasPropias = [];

    for (const receta of recetas) {
      const mascota = receta.consulta.mascota;

      if (mascota && mascota.usuarioId === usuario.id) {
        recetasPropias.push(receta);
      }
    }

    return recetasPropias;
  }

  return recetas;
};

const getById = async (id, usuario) => {
  const receta = await Receta.findByPk(id, {
    include: incluirRelaciones
  });

  if (!receta) {
    throw new NotFoundError(`Receta con id ${id} no encontrada`);
  }

  await verificarAcceso(receta.consulta, usuario);

  return receta;
};

const create = async (datos, usuario) => {
  const consulta = await Consulta.findByPk(datos.consultaId);

  if (!consulta) {
    throw new NotFoundError(
      `Consulta con id ${datos.consultaId} no encontrada`
    );
  }

  await verificarAcceso(consulta, usuario);

  const producto = await Producto.findByPk(datos.productoId);

  if (!producto) {
    throw new NotFoundError(
      `Producto con id ${datos.productoId} no encontrado`
    );
  }

  const receta = await Receta.create(datos);

  return await Receta.findByPk(receta.id, {
    include: incluirRelaciones
  });
};

const update = async (id, datos, usuario) => {
  const receta = await Receta.findByPk(id, {
    include: [{ model: Consulta, as: 'consulta' }]
  });

  if (!receta) {
    throw new NotFoundError(`Receta con id ${id} no encontrada`);
  }

  await verificarAcceso(receta.consulta, usuario);

  const camposPermitidos = [
    'productoId',
    'dosis',
    'frecuencia',
    'duracion',
    'indicaciones'
  ];

  const cambios = Object.fromEntries(
    Object.entries(datos).filter(([campo]) =>
      camposPermitidos.includes(campo)
    )
  );

  if (cambios.productoId) {
    const producto = await Producto.findByPk(cambios.productoId);

    if (!producto) {
      throw new NotFoundError(
        `Producto con id ${cambios.productoId} no encontrado`
      );
    }
  }

  await receta.update(cambios);

  return await Receta.findByPk(id, {
    include: incluirRelaciones
  });
};

const remove = async (id, usuario) => {
  const receta = await Receta.findByPk(id, {
    include: [{ model: Consulta, as: 'consulta' }]
  });

  if (!receta) {
    throw new NotFoundError(`Receta con id ${id} no encontrada`);
  }

  await verificarAcceso(receta.consulta, usuario);

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
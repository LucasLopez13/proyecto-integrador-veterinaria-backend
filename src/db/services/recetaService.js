const db = require('../models');
const { Receta, Prescripcion, Consulta, Mascota, Usuario, Producto } = db;

const {
  NotFoundError,
  ForbiddenError
} = require('../utils/customErrors');

const obtenerRol = (usuario) => {
  if (!usuario) return '';
  if (typeof usuario.rol === 'object' && usuario.rol?.nombre) {
    return String(usuario.rol.nombre).toUpperCase().trim();
  }
  return String(usuario.rol || usuario.role || '').toUpperCase().trim();
};

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

const calcularEstadoPorDuracion = (fechaBase, duracionDias) => {
  if (!fechaBase || !duracionDias) return 'activo';
  const inicio = new Date(fechaBase).getTime();
  const fin = inicio + Number(duracionDias) * 24 * 60 * 60 * 1000;
  return Date.now() > fin ? 'finalizado' : 'activo';
};

const formatearReceta = (recetaInstance) => {
  const plain = typeof recetaInstance.toJSON === 'function'
    ? recetaInstance.toJSON()
    : { ...recetaInstance };

  const fecha = plain.createdAt || plain.consulta?.fecha || new Date().toISOString();
  const medicamento = plain.producto?.nombre || plain.medicamento || 'Medicamento recetado';
  const mascota = plain.consulta?.mascota || plain.mascota || undefined;
  const profesional = plain.consulta?.veterinario || plain.profesional || undefined;
  const resumenPosologia = [
    plain.dosis ? `Dosis: ${plain.dosis}` : null,
    plain.frecuencia ? `Cada ${plain.frecuencia} hs` : null,
    plain.duracion ? `Durante ${plain.duracion} dias` : null
  ]
    .filter(Boolean)
    .join(' · ');

  const indicacionesCompletas = [resumenPosologia, plain.indicaciones]
    .filter(Boolean)
    .join(' — ');

  return {
    ...plain,
    fecha,
    medicamento,
    indicaciones: indicacionesCompletas || 'Seguir indicaciones del profesional.',
    estado: plain.estado || calcularEstadoPorDuracion(fecha, plain.duracion),
    mascotaId: plain.consulta?.mascotaId || plain.mascotaId,
    profesionalId: plain.consulta?.veterinarioId || plain.profesionalId,
    mascota,
    profesional
  };
};

const formatearPrescripcionComoReceta = (prescInstance) => {
  const plain = typeof prescInstance.toJSON === 'function'
    ? prescInstance.toJSON()
    : { ...prescInstance };

  const fecha = plain.createdAt || plain.consulta?.fecha || new Date().toISOString();
  const detalleDosis = plain.dosisTotal != null
    ? `${plain.dosisTotal} mg${plain.volumenMl != null ? ` (${plain.volumenMl} ml)` : ''}`
    : `${plain.dosisIndicada} ${plain.unidadDosis}`;

  const resumenPosologia = [
    `Dosis: ${detalleDosis}`,
    `Concentracion: ${plain.concentracion} ${plain.unidadConcentracion}`,
    `Cada ${plain.frecuenciaHoras} hs`,
    `Durante ${plain.duracionDias} dias`
  ].join(' · ');

  const indicacionesCompletas = [resumenPosologia, plain.indicaciones]
    .filter(Boolean)
    .join(' — ');

  return {
    id: plain.id,
    origen: 'prescripcion',
    fecha,
    medicamento: plain.medicamento,
    dosis: detalleDosis,
    frecuencia: plain.frecuenciaHoras,
    duracion: plain.duracionDias,
    indicaciones: indicacionesCompletas,
    estado: calcularEstadoPorDuracion(fecha, plain.duracionDias),
    confirmadaPorProfesional: plain.confirmadaPorProfesional,
    consultaId: plain.consultaId,
    mascotaId: plain.consulta?.mascotaId,
    profesionalId: plain.consulta?.veterinarioId,
    mascota: plain.consulta?.mascota,
    profesional: plain.consulta?.veterinario,
    consulta: plain.consulta,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt
  };
};

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

  const [recetasRaw, prescripcionesRaw] = await Promise.all([
    Receta.findAll({
      include: [
        {
          model: Consulta,
          as: 'consulta',
          where: whereConsulta,
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
      ],
      order: [['createdAt', 'DESC']]
    }),
    Prescripcion
      ? Prescripcion.findAll({
          include: [
            {
              model: Consulta,
              as: 'consulta',
              where: whereConsulta,
              include: [
                { model: Mascota, as: 'mascota' },
                {
                  model: Usuario,
                  as: 'veterinario',
                  attributes: ['id', 'nombre', 'apellido', 'email']
                }
              ]
            }
          ],
          order: [['createdAt', 'DESC']]
        })
      : Promise.resolve([])
  ]);

  let recetasFiltradas = recetasRaw;
  let prescripcionesFiltradas = prescripcionesRaw;

  if (rol === 'CLIENTE') {
    recetasFiltradas = recetasRaw.filter(
      (r) => r.consulta?.mascota && r.consulta.mascota.usuarioId === usuario.id
    );
    prescripcionesFiltradas = prescripcionesRaw.filter(
      (p) => p.consulta?.mascota && p.consulta.mascota.usuarioId === usuario.id
    );
  }

  const itemsUnificados = [
    ...recetasFiltradas.map(formatearReceta),
    ...prescripcionesFiltradas.map(formatearPrescripcionComoReceta)
  ].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return itemsUnificados;
};

const getById = async (id, usuario) => {
  const receta = await Receta.findByPk(id, {
    include: incluirRelaciones
  });

  if (!receta) {
    throw new NotFoundError(`Receta con id ${id} no encontrada`);
  }

  await verificarAcceso(receta.consulta, usuario);

  return formatearReceta(receta);
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

  const creada = await Receta.findByPk(receta.id, {
    include: incluirRelaciones
  });

  return formatearReceta(creada);
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

  const actualizada = await Receta.findByPk(id, {
    include: incluirRelaciones
  });

  return formatearReceta(actualizada);
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

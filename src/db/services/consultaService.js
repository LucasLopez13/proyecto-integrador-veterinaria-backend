const db = require('../models');
const { Consulta, Mascota, Usuario, Turno } = db;
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/customErrors');

const consultaService = {
  create: async (datos, usuario) => {
    const mascota = await Mascota.findByPk(datos.mascotaId);
    if (!mascota) {
      throw new NotFoundError(`La mascota con id ${datos.mascotaId} no existe`);
    }

    let turnoAsociado = null;
    if (datos.turnoId) {
      turnoAsociado = await Turno.findByPk(datos.turnoId);
      if (!turnoAsociado) {
        throw new NotFoundError(`El turno con id ${datos.turnoId} no existe`);
      }

      if (turnoAsociado.mascotaId !== Number(datos.mascotaId)) {
        throw new BadRequestError('El turno seleccionado no corresponde a la mascota indicada');
      }

      await turnoAsociado.update({ estado: 'atendido' });
    }

    const nuevaConsulta = await Consulta.create({
      fecha: datos.fecha || new Date(),
      subjetivo: datos.subjetivo,
      objetivo: datos.objetivo,
      peso: datos.peso,
      temperatura: datos.temperatura,
      frecuenciaCardiaca: datos.frecuenciaCardiaca || null,
      frecuenciaRespiratoria: datos.frecuenciaRespiratoria || null,
      analisis: datos.analisis,
      plan: datos.plan,
      observaciones: datos.observaciones || null,
      mascotaId: datos.mascotaId,
      veterinarioId: usuario.id,
      turnoId: datos.turnoId || null
    });

    if (datos.peso !== undefined && datos.peso !== null) {
      await mascota.update({ peso: Number(datos.peso) });
    }

    return await Consulta.findByPk(nuevaConsulta.id, {
      include: [
        { model: Mascota, as: 'mascota' },
        {
          model: Usuario,
          as: 'veterinario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        { model: Turno, as: 'turno' }
      ]
    });
  },

  getByMascotaId: async (mascotaId, usuario) => {
    const mascota = await Mascota.findByPk(mascotaId);
    if (!mascota) {
      throw new NotFoundError(`La mascota con id ${mascotaId} no existe`);
    }

    if (usuario.rol === 'cliente' && mascota.usuarioId !== usuario.id) {
      throw new ForbiddenError('No tienes permisos para consultar la historia clinica de esta mascota');
    }

    return await Consulta.findAll({
      where: { mascotaId },
      include: [
        {
          model: Usuario,
          as: 'veterinario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        { model: Turno, as: 'turno' }
      ],
      order: [['fecha', 'DESC']]
    });
  },

  getById: async (id, usuario) => {
    const consulta = await Consulta.findByPk(id, {
      include: [
        { model: Mascota, as: 'mascota' },
        {
          model: Usuario,
          as: 'veterinario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        { model: Turno, as: 'turno' }
      ]
    });

    if (!consulta) {
      throw new NotFoundError(`Consulta con id ${id} no encontrada`);
    }

    if (usuario.rol === 'cliente' && consulta.mascota && consulta.mascota.usuarioId !== usuario.id) {
      throw new ForbiddenError('No tienes permisos para consultar esta atencion medica');
    }

    return consulta;
  },

  getAll: async (usuario) => {
    return await Consulta.findAll({
      include: [
        { model: Mascota, as: 'mascota' },
        {
          model: Usuario,
          as: 'veterinario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        { model: Turno, as: 'turno' }
      ],
      order: [['fecha', 'DESC']]
    });
  }
};

module.exports = consultaService;

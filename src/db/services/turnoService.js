
const db = require('../models');
const { Turno, Mascota, Usuario, Pago } = db;
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError
} = require('../utils/customErrors');

const getRolNombre = (usuario) => {
  if (!usuario) return '';

  if (typeof usuario.rol === 'object' && usuario.rol?.nombre) {
    return usuario.rol.nombre.toLowerCase().trim();
  }

  return String(usuario.rol || '').toLowerCase().trim();
};

const esProfesional = (rol) =>
  ['profesional', 'admin'].includes(rol);

const fechaEnElPasado = (fecha) =>
  fecha && new Date(fecha).getTime() < Date.now() - 5 * 60 * 1000;

const turnoService = {
  getAll: async (usuario, query = {}) => {
    const rol = getRolNombre(usuario);
    const page = query.page ? parseInt(query.page, 10) : null;
    const limit = query.limit ? parseInt(query.limit, 10) : null;
    const puedeVerTodos = esProfesional(rol);

    const baseOptions = {
      include: [
        { model: Mascota, as: 'mascota' },
        { model: Pago, as: 'pagos' },
        ...(puedeVerTodos
          ? [{
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
          }]
          : [])
      ],
      where: puedeVerTodos ? {} : { usuarioId: usuario.id },
      order: [['fecha', 'DESC']]
    };

    if (page && limit && page > 0 && limit > 0) {
      const offset = (page - 1) * limit;
      const { count, rows } = await Turno.findAndCountAll({
        ...baseOptions,
        distinct: true,
        limit,
        offset
      });

      return {
        data: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    }

    return Turno.findAll(baseOptions);
  },

  getById: async (id, usuario) => {
    const rol = getRolNombre(usuario);

    const turno = await Turno.findByPk(id, {
      include: [
        { model: Mascota, as: 'mascota' },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        }
      ]
    });

    if (!turno) {
      throw new NotFoundError(`Turno con id ${id} no encontrado`);
    }

    if (rol === 'cliente' && turno.usuarioId !== usuario.id) {
      throw new ForbiddenError(
        'No tienes permisos para consultar este turno'
      );
    }

    return turno;
  },

  create: async (
    { fecha, motivo, estado, mascotaId, usuarioId: bodyUsuarioId },
    usuario
  ) => {
    const rol = getRolNombre(usuario);
    const usuarioId =
      esProfesional(rol) && bodyUsuarioId
        ? bodyUsuarioId
        : usuario.id;

    if (fechaEnElPasado(fecha)) {
      throw new BadRequestError(
        'No se pueden solicitar turnos en una fecha u hora que ya ha pasado'
      );
    }

    const mascota = await Mascota.findByPk(mascotaId);

    if (!mascota) {
      throw new NotFoundError(
        `La mascota con id ${mascotaId} no existe`
      );
    }

    if (rol === 'cliente' && mascota.usuarioId !== usuario.id) {
      throw new ForbiddenError(
        'Solo puedes solicitar turnos para tus propias mascotas'
      );
    }

    const nuevoTurno = await Turno.create({
      fecha,
      motivo,
      estado: estado || 'pendiente',
      usuarioId,
      mascotaId
    });

    return Turno.findByPk(nuevoTurno.id, {
      include: [
        { model: Mascota, as: 'mascota' },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        }
      ]
    });
  },

  update: async (id, usuario, datos) => {
    const rol = getRolNombre(usuario);
    const turno = await Turno.findByPk(id);

    if (!turno) {
      throw new NotFoundError(`Turno con id ${id} no encontrado`);
    }

    if (fechaEnElPasado(datos.fecha)) {
      throw new BadRequestError(
        'La nueva fecha y horario del turno no pueden ser en el pasado'
      );
    }

    const cambios = { ...datos };

    if (rol === 'cliente') {
      if (turno.usuarioId !== usuario.id) {
        throw new ForbiddenError(
          'No tienes permisos para modificar este turno'
        );
      }

      if (
        turno.estado === 'cancelado' ||
        turno.estado === 'completado'
      ) {
        throw new BadRequestError(
          'No se puede modificar un turno cancelado o completado'
        );
      }

      if (cambios.estado && cambios.estado !== 'cancelado') {
        throw new ForbiddenError(
          'Los clientes solo pueden cancelar sus propios turnos'
        );
      }

      // El cliente puede reprogramar o cancelar, pero no cambiar
      // al usuario ni a la mascota asociados al turno.
      delete cambios.usuarioId;
      delete cambios.mascotaId;
    }

    await turno.update(cambios);

    return Turno.findByPk(id, {
      include: [
        { model: Mascota, as: 'mascota' },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        }
      ]
    });
  },

  cambiarEstado: async (id, usuario, nuevoEstado) => {
    const rol = getRolNombre(usuario);

    if (!esProfesional(rol)) {
      throw new ForbiddenError(
        'Solo un profesional puede cambiar el estado del turno'
      );
    }

    const turno = await Turno.findByPk(id);

    if (!turno) {
      throw new NotFoundError(`Turno con id ${id} no encontrado`);
    }

    const transicionesPermitidas = {
      pendiente: ['confirmado', 'cancelado'],
      confirmado: ['completado', 'cancelado'],
      cancelado: [],
      completado: []
    };

    const estadosPermitidos = transicionesPermitidas[turno.estado] || [];

    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new BadRequestError(
        `No se puede cambiar el estado de "${turno.estado}" a "${nuevoEstado}"`
      );
    }

    await turno.update({ estado: nuevoEstado });

    return Turno.findByPk(id, {
      include: [
        { model: Mascota, as: 'mascota' },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        }
      ]
    });
  },

  delete: async (id, usuario) => {
    const rol = getRolNombre(usuario);
    const turno = await Turno.findByPk(id);

    if (!turno) {
      throw new NotFoundError(`Turno con id ${id} no encontrado`);
    }

    if (rol === 'cliente' && turno.usuarioId !== usuario.id) {
      throw new ForbiddenError(
        'No tienes permisos para eliminar este turno'
      );
    }

    await turno.destroy();

    return {
      message: 'Turno eliminado correctamente'
    };
  }
};

module.exports = turnoService;

const db = require('../models');
const { Turno, Mascota, Usuario } = db;
const { NotFoundError, ForbiddenError } = require('../utils/customErrors');

const getRolNombre = (usuario) => {
  if (!usuario) return '';
  if (typeof usuario.rol === 'object' && usuario.rol?.nombre) {
    return usuario.rol.nombre.toLowerCase();
  }
  return String(usuario.rol || '').toLowerCase();
};

const turnoService = {
  getAll: async (usuario) => {
    const rol = getRolNombre(usuario);

    if (rol === 'profesional' || rol === 'admin') {
      return await Turno.findAll({
        include: [
          { model: Mascota, as: 'mascota' },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
          }
        ],
        order: [['fecha', 'ASC']]
      });
    }

    return await Turno.findAll({
      where: {
        usuarioId: usuario.id
      },
      include: [
        { model: Mascota, as: 'mascota' }
      ],
      order: [['fecha', 'ASC']]
    });
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
      throw new ForbiddenError('No tienes permisos para consultar este turno');
    }

    return turno;
  },

  create: async ({ fecha, motivo, estado, mascotaId, usuarioId: bodyUsuarioId }, usuario) => {
    const rol = getRolNombre(usuario);
    const usuarioId = (rol === 'profesional' || rol === 'admin') && bodyUsuarioId ? bodyUsuarioId : usuario.id;

    const mascota = await Mascota.findByPk(mascotaId);
    if (!mascota) {
      throw new NotFoundError(`La mascota con id ${mascotaId} no existe`);
    }

    if (rol === 'cliente' && mascota.usuarioId !== usuario.id) {
      throw new ForbiddenError('Solo puedes solicitar turnos para tus propias mascotas');
    }

    const nuevoTurno = await Turno.create({
      fecha,
      motivo,
      estado: estado || 'pendiente',
      usuarioId,
      mascotaId
    });

    return await Turno.findByPk(nuevoTurno.id, {
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

    if (rol === 'cliente') {
      if (turno.usuarioId !== usuario.id) {
        throw new ForbiddenError('No tienes permisos para modificar este turno');
      }
      if (datos.estado && datos.estado !== 'cancelado') {
        throw new ForbiddenError('Los clientes solo pueden cancelar sus propios turnos');
      }
    }

    await turno.update(datos);

    return await Turno.findByPk(id, {
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
      throw new ForbiddenError('No tienes permisos para eliminar este turno');
    }

    await turno.destroy();

    return {
      message: 'Turno eliminado correctamente'
    };
  }
};

module.exports = turnoService;

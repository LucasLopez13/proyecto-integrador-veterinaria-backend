const db = require('../models');
const { Mascota, Usuario, Turno, Triage, Consulta } = db;
const { NotFoundError } = require('../utils/customErrors');
const { crearMascotaIngresoDirecto } = require('./triageService');

const getRolNombre = (usuario) => {
  if (!usuario) return '';
  if (typeof usuario === 'object') {
    if (usuario.rol && typeof usuario.rol === 'object' && usuario.rol.nombre) {
      return usuario.rol.nombre.toLowerCase();
    }
    return String(usuario.rol || '').toLowerCase();
  }
  return String(usuario || '').toLowerCase();
};

const mascotaService = {
  create: async ({ nombre, especie, raza, edad, sexo, peso }, usuarioId) => {
    const mascota = await Mascota.create({
      nombre,
      especie,
      raza,
      edad,
      sexo,
      peso,
      usuarioId
    });
    return mascota.toJSON();
  },

  getAll: async (usuario) => {
    const rol = getRolNombre(usuario);
    const usuarioId = typeof usuario === 'object' ? usuario.id : usuario;

    if (rol === 'profesional' || rol === 'admin' || rol === 'recepcion') {
      if (Triage) {
        try {
          const triagesHuerfanos = await Triage.findAll({
            where: { mascotaId: null },
            paranoid: false
          });
          for (const tr of triagesHuerfanos) {
            const nuevaMascota = await crearMascotaIngresoDirecto({
              nombrePaciente: tr.nombrePaciente,
              especie: tr.especie,
              raza: tr.raza,
              nombreTutor: tr.nombreTutor,
              telefonoTutor: tr.telefonoTutor
            });
            await tr.update({ mascotaId: nuevaMascota.id });
          }
        } catch (err) {
          console.error('Error al sincronizar mascotas de triage:', err);
        }
      }

      const inclusions = [
        {
          model: Usuario,
          as: 'dueno',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        }
      ];

      if (Turno) {
        inclusions.push({
          model: Turno,
          as: 'turnos',
          attributes: ['id', 'fecha', 'estado', 'motivo']
        });
      }

      if (Triage) {
        inclusions.push({
          model: Triage,
          as: 'triages',
          attributes: ['id', 'columna', 'motivo', 'estado', 'fechaLlegada', 'turnoId'],
          paranoid: false
        });
      }

      if (Consulta) {
        inclusions.push({
          model: Consulta,
          as: 'consultas',
          attributes: ['id', 'fecha']
        });
      }

      return await Mascota.findAll({
        include: inclusions,
        order: [['createdAt', 'DESC']]
      });
    }

    return await Mascota.findAll({
      where: {
        usuarioId
      },
      order: [['nombre', 'ASC']]
    });
  },

  getById: async (id, usuario) => {
    const rol = getRolNombre(usuario);
    const usuarioId = typeof usuario === 'object' ? usuario.id : usuario;

    const whereClause = { id };
    if (rol === 'cliente') {
      whereClause.usuarioId = usuarioId;
    }

    const mascota = await Mascota.findOne({
      where: whereClause,
      include: [
        {
          model: Usuario,
          as: 'dueno',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        }
      ]
    });

    if (!mascota) {
      throw new NotFoundError(`Mascota con id ${id} no encontrada`);
    }

    const data = mascota.toJSON();
    if (data.dueno) {
      data.usuario = data.dueno;
    }
    return data;
  },

  update: async (id, usuario, datos) => {
    const rol = getRolNombre(usuario);
    const usuarioId = typeof usuario === 'object' ? usuario.id : usuario;

    const whereClause = { id };
    if (rol === 'cliente') {
      whereClause.usuarioId = usuarioId;
    }

    const mascota = await Mascota.findOne({
      where: whereClause
    });

    if (!mascota) {
      throw new NotFoundError(`Mascota con id ${id} no encontrada`);
    }

    await mascota.update(datos);

    return mascota.toJSON();
  },

  delete: async (id, usuario) => {
    const rol = getRolNombre(usuario);
    const usuarioId = typeof usuario === 'object' ? usuario.id : usuario;

    const whereClause = { id };
    if (rol === 'cliente') {
      whereClause.usuarioId = usuarioId;
    }

    const mascota = await Mascota.findOne({
      where: whereClause
    });

    if (!mascota) {
      throw new NotFoundError(`Mascota con id ${id} no encontrada`);
    }

    await mascota.destroy();

    return {
      message: 'Mascota eliminada correctamente'
    };
  }
};

module.exports = mascotaService;

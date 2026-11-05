const db = require('../models');
const { Triage, Mascota, Usuario, Turno } = db;
const { NotFoundError, BadRequestError } = require('../utils/customErrors');
const { COLUMNAS_VALIDAS } = require('../schema/triageSchema');

async function crearMascotaIngresoDirecto({
  nombrePaciente,
  especie,
  raza,
  nombreTutor,
  telefonoTutor
}) {
  const textoTutor = (nombreTutor || 'Tutor Guardia').trim();
  const partes = textoTutor.split(/\s+/);
  const nombre = partes[0] || 'Tutor';
  const apellido = partes.slice(1).join(' ') || 'Ingreso Directo';

  let tutor = await Usuario.findOne({
    where: {
      nombre,
      apellido
    }
  });

  if (!tutor) {
    const emailUnico = `guardia.${Date.now()}.${Math.floor(Math.random() * 10000)}@vetcare.local`;
    tutor = await Usuario.create({
      nombre,
      apellido,
      email: emailUnico,
      password: 'guardia-ingreso-directo',
      telefono: telefonoTutor || null,
      rolId: 1
    });
  } else if (telefonoTutor && !tutor.telefono) {
    await tutor.update({ telefono: telefonoTutor });
  }

  const nuevaMascota = await Mascota.create({
    nombre: (nombrePaciente || 'Paciente Guardia').trim(),
    especie: especie || 'Canino',
    raza: raza || 'Ingreso Directo (Sin turno)',
    usuarioId: tutor.id
  });

  return nuevaMascota;
}

const triageService = {
  getKanban: async () => {
    try {
      const triagesSinMascota = await Triage.findAll({
        where: {
          mascotaId: null
        }
      });

      for (const tr of triagesSinMascota) {
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
      console.error('Error al vincular mascotas de ingreso directo en triage:', err);
    }

    if (Turno) {
      try {
        const hoy = new Date();
        const esMismoDia = (f1, f2) => {
          if (!f1 || !f2) return false;
          const d1 = new Date(f1);
          const d2 = new Date(f2);
          return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
          );
        };

        const triagesProgramados = await Triage.findAll({
          where: {
            estado: 'ACTIVO',
            columna: 'CONSULTA_PROGRAMADA'
          }
        });

        for (const tr of triagesProgramados) {
          if (tr.turnoId && !esMismoDia(tr.fechaLlegada, hoy)) {
            await tr.destroy();
          }
        }

        const turnosPendientes = await Turno.findAll({
          where: {
            estado: ['pendiente', 'confirmado']
          },
          include: [
            {
              model: Mascota,
              as: 'mascota',
              include: [{ model: Usuario, as: 'dueno' }]
            },
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['id', 'nombre', 'apellido', 'telefono', 'email']
            }
          ]
        });

        for (const t of turnosPendientes) {
          if (!t.mascota) continue;

          if (!esMismoDia(t.fecha, hoy)) continue;

          const existe = await Triage.findOne({
            where: { turnoId: t.id },
            paranoid: false
          });

          if (!existe) {
            const tutorNombre = t.usuario
              ? `${t.usuario.nombre} ${t.usuario.apellido}`.trim()
              : (t.mascota.dueno ? `${t.mascota.dueno.nombre} ${t.mascota.dueno.apellido}`.trim() : null);
            const telefono = t.usuario?.telefono || t.mascota.dueno?.telefono || null;

            await Triage.create({
              columna: 'CONSULTA_PROGRAMADA',
              nombrePaciente: t.mascota.nombre,
              especie: t.mascota.especie || 'Canino',
              raza: t.mascota.raza || null,
              nombreTutor: tutorNombre,
              telefonoTutor: telefono,
              motivo: t.motivo || 'Consulta medica programada',
              fechaLlegada: t.fecha || new Date(),
              estado: 'ACTIVO',
              mascotaId: t.mascotaId,
              turnoId: t.id
            });
          }
        }
      } catch (err) {
        console.error('Error al sincronizar turnos de hoy con triage:', err);
      }
    }

    return await Triage.findAll({
      where: { estado: 'ACTIVO' },
      include: [
        {
          model: Mascota,
          as: 'mascota',
          include: [
            {
              model: Usuario,
              as: 'dueno',
              attributes: ['id', 'nombre', 'apellido', 'telefono', 'email']
            }
          ]
        },
        {
          model: Usuario,
          as: 'veterinarioAsignado',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ],
      order: [['fechaLlegada', 'ASC']]
    });
  },

  getById: async (id) => {
    const item = await Triage.findByPk(id, {
      include: [
        {
          model: Mascota,
          as: 'mascota',
          include: [
            {
              model: Usuario,
              as: 'dueno',
              attributes: ['id', 'nombre', 'apellido', 'telefono', 'email']
            }
          ]
        },
        {
          model: Usuario,
          as: 'veterinarioAsignado',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    if (!item) {
      throw new NotFoundError(`Registro de Triage con id ${id} no encontrado`);
    }

    return item;
  },

  create: async (datos) => {
    let nombrePaciente = datos.nombrePaciente;
    let especie = datos.especie || 'Canino';
    let raza = datos.raza || null;
    let nombreTutor = datos.nombreTutor || null;
    let telefonoTutor = datos.telefonoTutor || null;
    let mascotaId = datos.mascotaId || null;

    if (mascotaId) {
      const mascota = await Mascota.findByPk(mascotaId, {
        include: [{ model: Usuario, as: 'dueno' }]
      });

      if (mascota) {
        nombrePaciente = nombrePaciente || mascota.nombre;
        especie = especie || mascota.especie;
        raza = raza || mascota.raza;
        if (mascota.dueno) {
          nombreTutor = nombreTutor || `${mascota.dueno.nombre} ${mascota.dueno.apellido}`.trim();
          telefonoTutor = telefonoTutor || mascota.dueno.telefono;
        }
      }
    } else {
      const nuevaMascota = await crearMascotaIngresoDirecto({
        nombrePaciente,
        especie,
        raza,
        nombreTutor,
        telefonoTutor
      });
      mascotaId = nuevaMascota.id;
    }

    const nuevoTriage = await Triage.create({
      columna: datos.columna || 'URGENCIA_MODERADA',
      nombrePaciente,
      especie,
      raza,
      nombreTutor,
      telefonoTutor,
      motivo: datos.motivo,
      fechaLlegada: datos.fechaLlegada || new Date(),
      notas: datos.notas || null,
      mascotaId,
      veterinarioAsignadoId: datos.veterinarioAsignadoId || null,
      estado: 'ACTIVO'
    });

    return await triageService.getById(nuevoTriage.id);
  },

  mover: async (id, nuevaColumna) => {
    if (!COLUMNAS_VALIDAS.includes(nuevaColumna)) {
      throw new BadRequestError(`Columna '${nuevaColumna}' no valida.`);
    }

    const item = await Triage.findByPk(id);
    if (!item) {
      throw new NotFoundError(`Registro de Triage con id ${id} no encontrado`);
    }

    await item.update({ columna: nuevaColumna });
    return await triageService.getById(item.id);
  },

  update: async (id, datos) => {
    const item = await Triage.findByPk(id);
    if (!item) {
      throw new NotFoundError(`Registro de Triage con id ${id} no encontrado`);
    }

    await item.update(datos);
    return await triageService.getById(item.id);
  },

  finalizar: async (id) => {
    const item = await Triage.findByPk(id);
    if (!item) {
      throw new NotFoundError(`Registro de Triage con id ${id} no encontrado`);
    }

    await item.update({ estado: 'FINALIZADO' });
    await item.destroy({ force: false });

    return {
      message: 'Paciente egresado del tablero de triage y guardia correctamente',
      id
    };
  },

  crearMascotaIngresoDirecto
};

module.exports = triageService;

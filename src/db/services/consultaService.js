const crypto = require('crypto');
const db = require('../models');
const { Consulta, Mascota, Usuario, Turno, VersionConsulta } = db;
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/customErrors');

function generarHashVersion({ consultaId, numeroVersion, autorId, tipoAccion, fechaVersion, snapshot }) {
  const payload = JSON.stringify({
    consultaId,
    numeroVersion,
    autorId,
    tipoAccion,
    fechaVersion: new Date(fechaVersion).toISOString(),
    snapshot
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

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
      version: 1,
      fecha: datos.fecha || new Date(),
      subjetivo: datos.subjetivo,
      objetivo: datos.objetivo,
      peso: Number(datos.peso),
      temperatura: Number(datos.temperatura),
      frecuenciaCardiaca: datos.frecuenciaCardiaca ? Number(datos.frecuenciaCardiaca) : null,
      frecuenciaRespiratoria: datos.frecuenciaRespiratoria ? Number(datos.frecuenciaRespiratoria) : null,
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

    const snapshotInicial = {
      subjetivo: nuevaConsulta.subjetivo,
      objetivo: nuevaConsulta.objetivo,
      peso: nuevaConsulta.peso,
      temperatura: nuevaConsulta.temperatura,
      frecuenciaCardiaca: nuevaConsulta.frecuenciaCardiaca,
      frecuenciaRespiratoria: nuevaConsulta.frecuenciaRespiratoria,
      analisis: nuevaConsulta.analisis,
      plan: nuevaConsulta.plan,
      observaciones: nuevaConsulta.observaciones,
      fecha: nuevaConsulta.fecha,
      mascotaId: nuevaConsulta.mascotaId,
      veterinarioId: nuevaConsulta.veterinarioId
    };

    const fechaVersion = nuevaConsulta.createdAt || new Date();
    const hashSha256 = generarHashVersion({
      consultaId: nuevaConsulta.id,
      numeroVersion: 1,
      autorId: usuario.id,
      tipoAccion: 'CREACION_INICIAL',
      fechaVersion,
      snapshot: snapshotInicial
    });

    await VersionConsulta.create({
      consultaId: nuevaConsulta.id,
      numeroVersion: 1,
      autorId: usuario.id,
      tipoAccion: 'CREACION_INICIAL',
      motivoEdicion: 'Registro inicial de la consulta médica SOAP',
      valoresAnteriores: null,
      valoresModificados: null,
      datosCompletosSnapshot: snapshotInicial,
      hashSha256,
      fechaVersion
    });

    return await Consulta.findByPk(nuevaConsulta.id, {
      include: [
        { model: Mascota, as: 'mascota' },
        {
          model: Usuario,
          as: 'veterinario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        { model: Turno, as: 'turno' },
        {
          model: VersionConsulta,
          as: 'versiones',
          include: [
            {
              model: Usuario,
              as: 'autor',
              attributes: ['id', 'nombre', 'apellido', 'email']
            }
          ]
        }
      ]
    });
  },

  update: async (id, datos, usuario) => {
    const consulta = await Consulta.findByPk(id, {
      include: [
        { model: Mascota, as: 'mascota' },
        { model: Usuario, as: 'veterinario' }
      ]
    });

    if (!consulta) {
      throw new NotFoundError(`Consulta con id ${id} no encontrada`);
    }

    const rol = String(usuario.rol?.nombre || usuario.rol || '').toUpperCase();
    if (rol !== 'ADMIN' && consulta.veterinarioId !== usuario.id) {
      throw new ForbiddenError('Solo el profesional responsable de la atención o un administrador pueden enmendar esta consulta');
    }

    const camposAuditables = [
      'subjetivo',
      'objetivo',
      'peso',
      'temperatura',
      'frecuenciaCardiaca',
      'frecuenciaRespiratoria',
      'analisis',
      'plan',
      'observaciones'
    ];

    const valoresAnteriores = {};
    const valoresModificados = {};
    let huboCambios = false;

    for (const campo of camposAuditables) {
      if (datos[campo] !== undefined) {
        let valorActual = consulta[campo];
        let valorNuevo = datos[campo];

        if (typeof valorActual === 'number') {
          valorNuevo = Number(valorNuevo);
        }
        if (valorNuevo === '' && valorActual === null) {
          valorNuevo = null;
        }

        if (valorActual !== valorNuevo) {
          valoresAnteriores[campo] = valorActual;
          valoresModificados[campo] = valorNuevo;
          huboCambios = true;
        }
      }
    }

    if (!huboCambios) {
      throw new BadRequestError('No se detectaron cambios en los campos clínicos de la consulta.');
    }

    const versionActual = consulta.version || 1;
    const nuevaVersion = versionActual + 1;

    const nuevoSnapshot = {
      subjetivo: datos.subjetivo !== undefined ? datos.subjetivo : consulta.subjetivo,
      objetivo: datos.objetivo !== undefined ? datos.objetivo : consulta.objetivo,
      peso: datos.peso !== undefined ? Number(datos.peso) : consulta.peso,
      temperatura: datos.temperatura !== undefined ? Number(datos.temperatura) : consulta.temperatura,
      frecuenciaCardiaca: datos.frecuenciaCardiaca !== undefined ? (datos.frecuenciaCardiaca ? Number(datos.frecuenciaCardiaca) : null) : consulta.frecuenciaCardiaca,
      frecuenciaRespiratoria: datos.frecuenciaRespiratoria !== undefined ? (datos.frecuenciaRespiratoria ? Number(datos.frecuenciaRespiratoria) : null) : consulta.frecuenciaRespiratoria,
      analisis: datos.analisis !== undefined ? datos.analisis : consulta.analisis,
      plan: datos.plan !== undefined ? datos.plan : consulta.plan,
      observaciones: datos.observaciones !== undefined ? datos.observaciones : consulta.observaciones,
      fecha: consulta.fecha,
      mascotaId: consulta.mascotaId,
      veterinarioId: consulta.veterinarioId
    };

    const fechaVersion = new Date();
    const hashSha256 = generarHashVersion({
      consultaId: consulta.id,
      numeroVersion: nuevaVersion,
      autorId: usuario.id,
      tipoAccion: 'MODIFICACION_ENMIENDA',
      fechaVersion,
      snapshot: nuevoSnapshot
    });

    await VersionConsulta.create({
      consultaId: consulta.id,
      numeroVersion: nuevaVersion,
      autorId: usuario.id,
      tipoAccion: 'MODIFICACION_ENMIENDA',
      motivoEdicion: datos.motivoEdicion,
      valoresAnteriores,
      valoresModificados,
      datosCompletosSnapshot: nuevoSnapshot,
      hashSha256,
      fechaVersion
    });

    await consulta.update({
      ...valoresModificados,
      version: nuevaVersion
    });

    if (valoresModificados.peso !== undefined && consulta.mascota) {
      await consulta.mascota.update({ peso: Number(valoresModificados.peso) });
    }

    return await Consulta.findByPk(consulta.id, {
      include: [
        { model: Mascota, as: 'mascota' },
        {
          model: Usuario,
          as: 'veterinario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        { model: Turno, as: 'turno' },
        {
          model: VersionConsulta,
          as: 'versiones',
          include: [
            {
              model: Usuario,
              as: 'autor',
              attributes: ['id', 'nombre', 'apellido', 'email']
            }
          ]
        }
      ]
    });
  },

  getVersiones: async (consultaId, usuario) => {
    const consulta = await Consulta.findByPk(consultaId, {
      include: [{ model: Mascota, as: 'mascota' }]
    });

    if (!consulta) {
      throw new NotFoundError(`Consulta con id ${consultaId} no encontrada`);
    }

    const rol = String(usuario.rol?.nombre || usuario.rol || '').toUpperCase();
    if (rol === 'CLIENTE' && consulta.mascota && consulta.mascota.usuarioId !== usuario.id) {
      throw new ForbiddenError('No tienes permisos para consultar la auditoría de esta consulta');
    }

    let versiones = await VersionConsulta.findAll({
      where: { consultaId },
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ],
      order: [['numeroVersion', 'ASC']]
    });

    // Retrocompatibilidad: Si es una consulta creada antes de este sistema de versionado
    if (versiones.length === 0) {
      const snapshotInicial = {
        subjetivo: consulta.subjetivo,
        objetivo: consulta.objetivo,
        peso: consulta.peso,
        temperatura: consulta.temperatura,
        frecuenciaCardiaca: consulta.frecuenciaCardiaca,
        frecuenciaRespiratoria: consulta.frecuenciaRespiratoria,
        analisis: consulta.analisis,
        plan: consulta.plan,
        observaciones: consulta.observaciones,
        fecha: consulta.fecha
      };
      const fechaVersion = consulta.createdAt || new Date();
      const hashSha256 = generarHashVersion({
        consultaId: consulta.id,
        numeroVersion: 1,
        autorId: consulta.veterinarioId,
        tipoAccion: 'CREACION_INICIAL',
        fechaVersion,
        snapshot: snapshotInicial
      });

      const v1 = await VersionConsulta.create({
        consultaId: consulta.id,
        numeroVersion: 1,
        autorId: consulta.veterinarioId,
        tipoAccion: 'CREACION_INICIAL',
        motivoEdicion: 'Registro histórico inicial de la consulta médica SOAP',
        valoresAnteriores: null,
        valoresModificados: null,
        datosCompletosSnapshot: snapshotInicial,
        hashSha256,
        fechaVersion
      });

      const v1ConAutor = await VersionConsulta.findByPk(v1.id, {
        include: [
          {
            model: Usuario,
            as: 'autor',
            attributes: ['id', 'nombre', 'apellido', 'email']
          }
        ]
      });

      versiones = [v1ConAutor];
    }

    return versiones;
  },

  delete: async (id, motivoAnulacion, usuario) => {
    const consulta = await Consulta.findByPk(id, {
      include: [{ model: Mascota, as: 'mascota' }]
    });

    if (!consulta) {
      throw new NotFoundError(`Consulta con id ${id} no encontrada`);
    }

    const rol = String(usuario.rol?.nombre || usuario.rol || '').toUpperCase();
    if (rol !== 'ADMIN' && consulta.veterinarioId !== usuario.id) {
      throw new ForbiddenError('Solo el profesional responsable de la atención o un administrador pueden anular esta consulta');
    }

    const versionActual = consulta.version || 1;
    const nuevaVersion = versionActual + 1;
    const fechaVersion = new Date();

    const snapshotFinal = {
      subjetivo: consulta.subjetivo,
      objetivo: consulta.objetivo,
      peso: consulta.peso,
      temperatura: consulta.temperatura,
      frecuenciaCardiaca: consulta.frecuenciaCardiaca,
      frecuenciaRespiratoria: consulta.frecuenciaRespiratoria,
      analisis: consulta.analisis,
      plan: consulta.plan,
      observaciones: consulta.observaciones,
      estado: 'ANULADA_LOGICAMENTE'
    };

    const hashSha256 = generarHashVersion({
      consultaId: consulta.id,
      numeroVersion: nuevaVersion,
      autorId: usuario.id,
      tipoAccion: 'ANULACION_LOGICA',
      fechaVersion,
      snapshot: snapshotFinal
    });

    await VersionConsulta.create({
      consultaId: consulta.id,
      numeroVersion: nuevaVersion,
      autorId: usuario.id,
      tipoAccion: 'ANULACION_LOGICA',
      motivoEdicion: motivoAnulacion || 'Anulación lógica de la consulta médica',
      valoresAnteriores: null,
      valoresModificados: { estado: 'ANULADA_LOGICAMENTE' },
      datosCompletosSnapshot: snapshotFinal,
      hashSha256,
      fechaVersion
    });

    // Prohibición estricta de borrado físico: solo soft delete (deletedAt)
    await consulta.destroy({ force: false });

    return {
      message: 'Consulta anulada lógicamente de manera exitosa (soft delete registrado en auditoría)',
      consultaId: id,
      versionAnulacion: nuevaVersion
    };
  },

  getByMascotaId: async (mascotaId, usuario) => {
    const mascota = await Mascota.findByPk(mascotaId);
    if (!mascota) {
      throw new NotFoundError(`La mascota con id ${mascotaId} no existe`);
    }

    const rol = String(usuario.rol?.nombre || usuario.rol || '').toLowerCase();
    if (rol === 'cliente' && mascota.usuarioId !== usuario.id) {
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
        { model: Turno, as: 'turno' },
        {
          model: VersionConsulta,
          as: 'versiones',
          include: [
            {
              model: Usuario,
              as: 'autor',
              attributes: ['id', 'nombre', 'apellido', 'email']
            }
          ]
        }
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
        { model: Turno, as: 'turno' },
        {
          model: VersionConsulta,
          as: 'versiones',
          include: [
            {
              model: Usuario,
              as: 'autor',
              attributes: ['id', 'nombre', 'apellido', 'email']
            }
          ]
        }
      ]
    });

    if (!consulta) {
      throw new NotFoundError(`Consulta con id ${id} no encontrada`);
    }

    const rol = String(usuario.rol?.nombre || usuario.rol || '').toLowerCase();
    if (rol === 'cliente' && consulta.mascota && consulta.mascota.usuarioId !== usuario.id) {
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
        { model: Turno, as: 'turno' },
        {
          model: VersionConsulta,
          as: 'versiones',
          include: [
            {
              model: Usuario,
              as: 'autor',
              attributes: ['id', 'nombre', 'apellido', 'email']
            }
          ]
        }
      ],
      order: [['fecha', 'DESC']]
    });
  }
};

module.exports = consultaService;

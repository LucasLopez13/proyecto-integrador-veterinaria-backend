const fs = require('fs/promises');

const db = require('../models');
const { Op } = require('sequelize');
const { ArchivoMedico, Mascota, Consulta} = db;
const { NotFoundError,ForbiddenError} = require('../utils/customErrors');
const {verificarAccesoMascota} = require('../utils/mascotaAcces');
const getRole = (usuario) => {
    const nombre = usuario?.rol?.nombre || usuario?.rol || '';
    return String(nombre).toLowerCase().trim();
};

const archivoMedicoService = {
  create: async (
    { nombre, nombreArchivo, tipo, ruta, mascotaId },
    usuario
  ) => {
    const mascota = await verificarAccesoMascota(
            mascotaId,
            usuario
    );

    const archivo = await ArchivoMedico.create({
      nombre,
      nombreArchivo,
      tipo,
      ruta,
      mascotaId: mascota.id
    });

    return archivo.toJSON();
  },

  getAll: async (usuario) => {
    const rol = getRole(usuario);
    if (!usuario?.id) {
            throw new ForbiddenError('Usuario no autenticado');
    }
    if (rol === 'admin') {
            return await ArchivoMedico.findAll({
                include: [{ model: Mascota, as: 'mascota' }],
                order: [['fecha', 'DESC']]
            });
    }
    if (rol === 'cliente') {
            return await ArchivoMedico.findAll({
                include: [{
                    model: Mascota,
                    as: 'mascota',
                    where: { usuarioId: usuario.id }
                }],
                order: [['fecha', 'DESC']]
            });
    }
    if (rol === 'profesional') {
            const consultas = await Consulta.findAll({
                where: { veterinarioId: usuario.id },
                attributes: ['mascotaId'],
                raw: true
            });

            const mascotaIds = [
                ...new Set(consultas.map(c => c.mascotaId))
            ];

            if (mascotaIds.length === 0) {
                return [];
            }

            return await ArchivoMedico.findAll({
                where: {
                    mascotaId: { [Op.in]: mascotaIds }
                },
                include: [{ model: Mascota, as: 'mascota' }],
                order: [['fecha', 'DESC']]
            });
        }
    throw new ForbiddenError(
            'No tienes permisos para consultar archivos médicos'
    );
  },

  getById: async (id, usuario) => {
    const archivo = await ArchivoMedico.findByPk(id, {
            include: [{ model: Mascota, as: 'mascota' }]
    });

    if (!archivo) {
      throw new NotFoundError(
        `Archivo médico con id ${id} no encontrado`
      );
    }
    await verificarAccesoMascota(
            archivo.mascotaId,
            usuario
    )
    return archivo.toJSON();
  },

  getByMascota: async (mascotaId, usuario) => {
    const mascota = await verificarAccesoMascota(
            mascotaId,
            usuario
    );

    return await ArchivoMedico.findAll({
      where: {
        mascotaId:mascota.id
      },
      order: [['fecha', 'DESC']]
    });
  },

  getFile: async (id, usuario) => {
    const archivo = await ArchivoMedico.findByPk(id);

    if (!archivo) {
      throw new NotFoundError(
        `Archivo médico con id ${id} no encontrado`
      );
    }
    await verificarAccesoMascota(
            archivo.mascotaId,
            usuario
        );
    return archivo;
  },

  delete: async (id, usuario) => {
    const rol = getRole(usuario);
    if (rol !== 'profesional' && rol !== 'admin') {
            throw new ForbiddenError(
                'Solo un profesional o administrador puede eliminar archivos médicos'
            );
    }
    const archivo = await ArchivoMedico.findByPk(id);
    if (!archivo) {
      throw new NotFoundError(
        `Archivo médico con id ${id} no encontrado`
      );
    }
    await verificarAccesoMascota(
            archivo.mascotaId,
            usuario,
            { soloProfesional: true }
    );
    // Eliminar el archivo físico del servidor
    try {
      await fs.unlink(archivo.ruta);
    } catch (error) {
      // Si el archivo ya no existe, continuamos con la eliminación
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Eliminar el registro de la base de datos
    await archivo.destroy();

    return {
      message: 'Archivo médico eliminado correctamente'
    };
  }
};

module.exports = archivoMedicoService;
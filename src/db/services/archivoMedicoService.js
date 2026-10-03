const fs = require('fs/promises');

const db = require('../models');
const { ArchivoMedico, Mascota } = db;
const { NotFoundError } = require('../utils/customErrors');

const archivoMedicoService = {
  create: async (
    { nombre, nombreArchivo, tipo, ruta, mascotaId },
    usuarioId
  ) => {
    const mascota = await Mascota.findOne({
      where: {
        id: mascotaId,
        usuarioId
      }
    });

    if (!mascota) {
      throw new NotFoundError(
        `Mascota con id ${mascotaId} no encontrada`
      );
    }

    const archivo = await ArchivoMedico.create({
      nombre,
      nombreArchivo,
      tipo,
      ruta,
      mascotaId
    });

    return archivo.toJSON();
  },

  getAll: async (usuarioId) => {
    return await ArchivoMedico.findAll({
      include: [
        {
          model: Mascota,
          as: 'mascota',
          where: {
            usuarioId
          }
        }
      ],
      order: [['fecha', 'DESC']]
    });
  },

  getById: async (id, usuarioId) => {
    const archivo = await ArchivoMedico.findOne({
      where: {
        id
      },
      include: [
        {
          model: Mascota,
          as: 'mascota',
          where: {
            usuarioId
          }
        }
      ]
    });

    if (!archivo) {
      throw new NotFoundError(
        `Archivo médico con id ${id} no encontrado`
      );
    }

    return archivo.toJSON();
  },

  getByMascota: async (mascotaId, usuarioId) => {
    const mascota = await Mascota.findOne({
      where: {
        id: mascotaId,
        usuarioId
      }
    });

    if (!mascota) {
      throw new NotFoundError(
        `Mascota con id ${mascotaId} no encontrada`
      );
    }

    return await ArchivoMedico.findAll({
      where: {
        mascotaId
      },
      order: [['fecha', 'DESC']]
    });
  },

  getFile: async (id, usuarioId) => {
    const archivo = await ArchivoMedico.findOne({
      where: {
        id
      },
      include: [
        {
          model: Mascota,
          as: 'mascota',
          where: {
            usuarioId
          }
        }
      ]
    });

    if (!archivo) {
      throw new NotFoundError(
        `Archivo médico con id ${id} no encontrado`
      );
    }

    return archivo;
  },

  delete: async (id, usuarioId) => {
    const archivo = await ArchivoMedico.findOne({
      where: {
        id
      },
      include: [
        {
          model: Mascota,
          as: 'mascota',
          where: {
            usuarioId
          }
        }
      ]
    });

    if (!archivo) {
      throw new NotFoundError(
        `Archivo médico con id ${id} no encontrado`
      );
    }

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
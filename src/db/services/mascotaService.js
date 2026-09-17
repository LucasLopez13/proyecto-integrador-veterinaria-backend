const db = require('../models');
const { Mascota } = db;
const { NotFoundError, ConflictError } = require('../utils/customErrors');

const mascotaService = {
    create: async ({ nombre, especie, raza, edad, sexo }, usuarioId) => {
        const mascota = await Mascota.create({
            nombre,
            especie,
            raza,
            edad,
            sexo,
            usuarioId
        });
        return mascota.toJSON();

    },
    getAll: async (usuarioId) => {
        return await Mascota.findAll({
            where: {
                usuarioId
            }
        });

    },
    getById: async (id, usuarioId) => {
        const mascota = await Mascota.findOne({
            where: {
                id,
                usuarioId
            }
        });

        if (!mascota) {
            throw new NotFoundError(`Mascota con id ${id} no encontrada`);
        }

        return mascota.toJSON();
    },
    update: async (id, usuarioId, datos) => {

        const mascota = await Mascota.findOne({
            where: {
                id,
                usuarioId
            }
        });

        if (!mascota) {
            throw new NotFoundError(`Mascota con id ${id} no encontrada`);
        }

        await mascota.update(datos);

        return mascota.toJSON();
    },
    delete: async (id, usuarioId) => {

        const mascota = await Mascota.findOne({
            where: {
                id,
                usuarioId
            }
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
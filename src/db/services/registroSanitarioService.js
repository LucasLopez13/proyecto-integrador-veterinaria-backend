const db = require('../models');
const { RegistroSanitario, Mascota } = db;
const { NotFoundError } = require('../utils/customErrors');

const registroSanitarioService = {

    create: async ({ tipo, nombre, lote, fechaAplicacion, fechaRefuerzoEstimada, mascotaId }, usuarioId) => {
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
        const registro = await RegistroSanitario.create({
            tipo,
            nombre,
            lote,
            fechaAplicacion,
            fechaRefuerzoEstimada,
            mascotaId
        });
        return registro.toJSON(); 
    },
    getAll: async (usuarioId) => {
        return await RegistroSanitario.findAll({
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
    },
    getById: async (id, usuarioId) => {
        const registro = await RegistroSanitario.findOne({
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
        if (!registro) {
            throw new NotFoundError(
                `Registro sanitario con id ${id} no encontrado`
            );
        }
        return registro.toJSON();
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
        return await RegistroSanitario.findAll({
            where: {
                mascotaId
            }
        });
    },
    update: async (id, usuarioId, datos) => {
        const registro = await RegistroSanitario.findOne({
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
        if (!registro) {
            throw new NotFoundError(
                `Registro sanitario con id ${id} no encontrado`
            );
        }
        await registro.update(datos);
        return registro.toJSON();
    },
    delete: async (id, usuarioId) => {
        const registro = await RegistroSanitario.findOne({
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
        if (!registro) {
            throw new NotFoundError(
                `Registro sanitario con id ${id} no encontrado`
            );
        }
        await registro.destroy();
        return {
            message: 'Registro sanitario eliminado correctamente'
        };
    }

};

module.exports = registroSanitarioService;
const registroSanitarioService = require('../services/registroSanitarioService');

const registroSanitarioController = {

    getAll: async (req, res, next) => {
        try {
            const registros = await registroSanitarioService.getAll(req.user);
            res.status(200).json(registros);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const registro = await registroSanitarioService.getById(
                req.params.id,
                req.user
            );
            res.status(200).json(registro);
        } catch (error) {
            next(error);
        }
    },
    getByMascota: async (req, res, next) => {
        try {
            const registros = await registroSanitarioService.getByMascota(
                req.params.mascotaId,
                req.user
            );

            res.status(200).json(registros);
        } catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const registro = await registroSanitarioService.create(
                req.body,
                req.user
            );
            res.status(201).json(registro);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const registro = await registroSanitarioService.update(
                req.params.id,
                req.user,
                req.body
            );
            res.status(200).json(registro);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const resultado = await registroSanitarioService.delete(
                req.params.id,
                req.user
            );
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

};

module.exports = registroSanitarioController;
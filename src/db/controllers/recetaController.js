const recetaService = require('../services/recetaService');

const getAll = async (req, res, next) => {
    try {
        const recetas = await recetaService.getAll(req.user.id);
        res.json(recetas);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const receta = await recetaService.getById(
            req.params.id,
            req.user.id
        );

        if (!receta) {
            return res.status(404).json({
                message: 'Receta no encontrada'
            });
        }

        res.json(receta);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const receta = await recetaService.create(req.body);
        res.status(201).json(receta);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const receta = await recetaService.update(req.params.id, req.body);

        if (!receta) {
            return res.status(404).json({
                message: 'Receta no encontrada'
            });
        }

        res.json(receta);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const receta = await recetaService.remove(req.params.id);

        if (!receta) {
            return res.status(404).json({
                message: 'Receta no encontrada'
            });
        }

        res.json({
            message: 'Receta eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
const recetaService = require('../services/recetaService');

const getAll = async (req, res, next) => {
  try {
    const recetas = await recetaService.getAll(req.user);
    res.status(200).json(recetas);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const receta = await recetaService.getById(
      Number(req.params.id),
      req.user
    );

    res.status(200).json(receta);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const receta = await recetaService.create(
      req.body,
      req.user
    );

    res.status(201).json(receta);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const receta = await recetaService.update(
      Number(req.params.id),
      req.body,
      req.user
    );

    res.status(200).json(receta);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await recetaService.remove(
      Number(req.params.id),
      req.user
    );

    res.status(200).json({
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
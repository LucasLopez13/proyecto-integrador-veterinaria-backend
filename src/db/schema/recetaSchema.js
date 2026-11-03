const Joi = require('joi');

const recetaCreateSchema = Joi.object({
  consultaId: Joi.number().integer().positive().required(),
  productoId: Joi.number().integer().positive().required(),
  dosis: Joi.string().trim().min(1).required(),
  frecuencia: Joi.number().integer().positive().required(),
  duracion: Joi.number().integer().positive().required(),
  indicaciones: Joi.string().trim().max(2000).allow('', null).optional()
});

const recetaUpdateSchema = Joi.object({
  productoId: Joi.number().integer().positive(),
  dosis: Joi.string().trim().min(1),
  frecuencia: Joi.number().integer().positive(),
  duracion: Joi.number().integer().positive(),
  indicaciones: Joi.string().trim().max(2000).allow('', null)
}).min(1);

module.exports = {
  recetaCreateSchema,
  recetaUpdateSchema
};
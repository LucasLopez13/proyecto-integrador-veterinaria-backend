const Joi = require('joi');

const prescripcionCreateSchema = Joi.object({
  medicamento: Joi.string().trim().min(2).max(150).required(),
  concentracion: Joi.number().positive().required(),
  unidadConcentracion: Joi.string().trim().min(1).max(30).required(),
  dosisIndicada: Joi.number().positive().required(),
  unidadDosis: Joi.string().trim().min(1).max(30).required(),
  unidadAdministracion: Joi.string()
    .valid('ml', 'comprimidos')
    .required(),
  frecuenciaHoras: Joi.number().integer().positive().required(),
  duracionDias: Joi.number().integer().positive().required(),
  indicaciones: Joi.string().trim().max(2000).allow('', null).optional(),
});

module.exports = {
  prescripcionCreateSchema
};
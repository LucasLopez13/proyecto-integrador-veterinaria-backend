const Joi = require('joi');

const prescripcionCreateSchema = Joi.object({
  medicamento: Joi.string().trim().min(2).max(150).required(),
  concentracion: Joi.number().positive().required(),
  unidadConcentracion: Joi.string().trim().min(1).max(30).required(),
  dosisIndicada: Joi.number().positive().required(),
  unidadDosis: Joi.string().trim().min(1).max(30).required()
});

module.exports = {
  prescripcionCreateSchema
};

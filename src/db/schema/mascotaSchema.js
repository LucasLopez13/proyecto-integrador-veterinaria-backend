const Joi = require('joi');

const mascotaCreateSchema = Joi.object({
  nombre: Joi.string().min(1).max(50).required(),
  especie: Joi.string().min(2).max(50).required(),
  raza: Joi.string().allow('', null).optional(),
  edad: Joi.number().integer().min(0).max(50).optional(),
  sexo: Joi.string().valid('macho', 'hembra', 'desconocido').optional(),
  peso: Joi.number().positive().min(0.01).max(300).optional()
});

const mascotaUpdateSchema = Joi.object({
  nombre: Joi.string().min(1).max(50).optional(),
  especie: Joi.string().min(2).max(50).optional(),
  raza: Joi.string().allow('', null).optional(),
  edad: Joi.number().integer().min(0).max(50).optional(),
  sexo: Joi.string().valid('macho', 'hembra', 'desconocido').optional(),
  peso: Joi.number().positive().min(0.01).max(300).optional()
});

module.exports = {
  mascotaCreateSchema,
  mascotaUpdateSchema
};

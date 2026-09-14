const Joi = require('joi');

const mascotaCreateSchema = Joi.object({
  nombre: Joi.string().min(1).max(50).required(),
  especie: Joi.string().min(2).max(50).required(),
  raza: Joi.string().allow('', null).optional(),
  edad: Joi.number().integer().min(0).max(50).optional(),
  sexo: Joi.string().valid('macho', 'hembra', 'desconocido').optional(),
  usuarioId: Joi.number().integer().positive().required()
});

const mascotaUpdateSchema = Joi.object({
  nombre: Joi.string().min(1).max(50).optional(),
  especie: Joi.string().min(2).max(50).optional(),
  raza: Joi.string().allow('', null).optional(),
  edad: Joi.number().integer().min(0).max(50).optional(),
  sexo: Joi.string().valid('macho', 'hembra', 'desconocido').optional(),
  usuarioId: Joi.number().integer().positive().optional()
});

module.exports = {
  mascotaCreateSchema,
  mascotaUpdateSchema
};

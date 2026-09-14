const Joi = require('joi');

const usuarioCreateSchema = Joi.object({
  nombre: Joi.string().min(2).max(50).required(),
  apellido: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  telefono: Joi.string().allow('', null).optional(),
  rol: Joi.string().valid('cliente', 'veterinario', 'admin').optional()
});

const usuarioUpdateSchema = Joi.object({
  nombre: Joi.string().min(2).max(50).optional(),
  apellido: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  telefono: Joi.string().allow('', null).optional(),
  rol: Joi.string().valid('cliente', 'veterinario', 'admin').optional()
});

module.exports = {
  usuarioCreateSchema,
  usuarioUpdateSchema
};

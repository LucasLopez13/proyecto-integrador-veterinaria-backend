const Joi = require('joi');

const authRegisterSchema = Joi.object({
  nombre: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'El nombre es obligatorio',
    'string.min': 'El nombre debe tener al menos 2 caracteres'
  }),
  apellido: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'El apellido es obligatorio',
    'string.min': 'El apellido debe tener al menos 2 caracteres'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'El correo electrónico es obligatorio',
    'string.email': 'Debe proporcionar un correo electrónico válido'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'La contraseña es obligatoria',
    'string.min': 'La contraseña debe tener al menos 6 caracteres'
  }),
  telefono: Joi.string().allow('', null).optional(),
  rol: Joi.string().valid('cliente', 'profesional').default('cliente').optional()
});

const authLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'El correo electrónico es obligatorio',
    'string.email': 'Debe proporcionar un correo electrónico válido'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es obligatoria'
  })
});

const usuarioCreateSchema = Joi.object({
  nombre: Joi.string().min(2).max(50).required(),
  apellido: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  telefono: Joi.string().allow('', null).optional(),
  rol: Joi.string().valid('cliente', 'profesional').default('cliente').optional()
});

const usuarioUpdateSchema = Joi.object({
  nombre: Joi.string().min(2).max(50).optional(),
  apellido: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  telefono: Joi.string().allow('', null).optional(),
  rol: Joi.string().valid('cliente', 'profesional').optional()
});

module.exports = {
  authRegisterSchema,
  authLoginSchema,
  usuarioCreateSchema,
  usuarioUpdateSchema
};

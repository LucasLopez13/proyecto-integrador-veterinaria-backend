const Joi = require('joi');

const turnoCreateSchema = Joi.object({
  fecha: Joi.date().iso().required(),
  motivo: Joi.string().min(3).max(255).required(),
  estado: Joi.string().valid('pendiente', 'confirmado', 'cancelado', 'completado').optional(),
  usuarioId: Joi.number().integer().positive().required(),
  mascotaId: Joi.number().integer().positive().required()
});

const turnoUpdateSchema = Joi.object({
  fecha: Joi.date().iso().optional(),
  motivo: Joi.string().min(3).max(255).optional(),
  estado: Joi.string().valid('pendiente', 'confirmado', 'cancelado', 'completado').optional(),
  usuarioId: Joi.number().integer().positive().optional(),
  mascotaId: Joi.number().integer().positive().optional()
});

module.exports = {
  turnoCreateSchema,
  turnoUpdateSchema
};

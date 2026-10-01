const Joi = require('joi');

const registroSanitarioCreateSchema = Joi.object({
  tipo: Joi.string().valid('vacuna', 'antiparasitario').required(),
  nombre: Joi.string().min(2).max(100).required(),
  lote: Joi.string().max(100).allow('', null).optional(),
  fechaAplicacion: Joi.date().iso().required(),
  fechaRefuerzoEstimada: Joi.date().iso().allow(null).optional(),
  mascotaId: Joi.number().integer().positive().required()
});

const registroSanitarioUpdateSchema = Joi.object({
  tipo: Joi.string().valid('vacuna', 'antiparasitario').optional(),
  nombre: Joi.string().min(2).max(100).optional(),
  lote: Joi.string().max(100).allow('', null).optional(),
  fechaAplicacion: Joi.date().iso().optional(),
  fechaRefuerzoEstimada: Joi.date().iso().allow(null).optional()
}).min(1);

module.exports = {
  registroSanitarioCreateSchema,
  registroSanitarioUpdateSchema
};

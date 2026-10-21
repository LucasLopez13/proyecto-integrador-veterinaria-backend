const Joi = require('joi');

const consultaCreateSchema = Joi.object({
  fecha: Joi.date().iso().optional(),
  subjetivo: Joi.string().min(3).required(),
  objetivo: Joi.string().min(3).required(),
  peso: Joi.number().positive().min(0.01).max(300).required(),
  temperatura: Joi.number().min(30).max(45).required(),
  frecuenciaCardiaca: Joi.number().integer().min(20).max(300).allow(null).optional(),
  frecuenciaRespiratoria: Joi.number().integer().min(5).max(150).allow(null).optional(),
  analisis: Joi.string().min(3).required(),
  plan: Joi.string().min(3).required(),
  observaciones: Joi.string().allow('', null).optional(),
  mascotaId: Joi.number().integer().positive().required(),
  turnoId: Joi.number().integer().positive().allow(null).optional()
});

const consultaUpdateSchema = Joi.object({
  fecha: Joi.date().iso().optional(),
  subjetivo: Joi.string().min(3).optional(),
  objetivo: Joi.string().min(3).optional(),
  peso: Joi.number().positive().min(0.01).max(300).optional(),
  temperatura: Joi.number().min(30).max(45).optional(),
  frecuenciaCardiaca: Joi.number().integer().min(20).max(300).allow(null).optional(),
  frecuenciaRespiratoria: Joi.number().integer().min(5).max(150).allow(null).optional(),
  analisis: Joi.string().min(3).optional(),
  plan: Joi.string().min(3).optional(),
  observaciones: Joi.string().allow('', null).optional(),
  mascotaId: Joi.number().integer().positive().optional(),
  turnoId: Joi.number().integer().positive().allow(null).optional()
});

module.exports = {
  consultaCreateSchema,
  consultaUpdateSchema
};

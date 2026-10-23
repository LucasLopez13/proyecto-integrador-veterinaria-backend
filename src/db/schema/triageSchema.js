const Joi = require('joi');

const COLUMNAS_VALIDAS = [
  'EMERGENCIA_CRITICA',
  'URGENCIA_MODERADA',
  'CONSULTA_PROGRAMADA',
  'INTERNACION_QUIROFANO'
];

const triageCreateSchema = Joi.object({
  columna: Joi.string().valid(...COLUMNAS_VALIDAS).default('URGENCIA_MODERADA'),
  nombrePaciente: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'El nombre del paciente es obligatorio',
    'string.empty': 'El nombre del paciente no puede estar vacío'
  }),
  especie: Joi.string().trim().min(2).max(50).default('Canino'),
  raza: Joi.string().trim().allow('', null).optional(),
  nombreTutor: Joi.string().trim().allow('', null).optional(),
  telefonoTutor: Joi.string().trim().allow('', null).optional(),
  motivo: Joi.string().trim().min(3).max(1000).required().messages({
    'any.required': 'El motivo de ingreso es obligatorio',
    'string.empty': 'El motivo de ingreso no puede estar vacío',
    'string.min': 'El motivo debe tener al menos 3 caracteres'
  }),
  fechaLlegada: Joi.date().iso().optional(),
  notas: Joi.string().trim().allow('', null).optional(),
  mascotaId: Joi.number().integer().positive().allow(null).optional(),
  veterinarioAsignadoId: Joi.number().integer().positive().allow(null).optional(),
  turnoId: Joi.number().integer().positive().allow(null).optional()
});

const triageMoverSchema = Joi.object({
  columna: Joi.string().valid(...COLUMNAS_VALIDAS).required().messages({
    'any.required': 'La columna de destino es obligatoria',
    'any.only': 'La columna debe ser EMERGENCIA_CRITICA, URGENCIA_MODERADA, CONSULTA_PROGRAMADA o INTERNACION_QUIROFANO'
  })
});

const triageUpdateSchema = Joi.object({
  columna: Joi.string().valid(...COLUMNAS_VALIDAS).optional(),
  nombrePaciente: Joi.string().trim().min(2).max(100).optional(),
  especie: Joi.string().trim().min(2).max(50).optional(),
  raza: Joi.string().trim().allow('', null).optional(),
  nombreTutor: Joi.string().trim().allow('', null).optional(),
  telefonoTutor: Joi.string().trim().allow('', null).optional(),
  motivo: Joi.string().trim().min(3).max(1000).optional(),
  fechaLlegada: Joi.date().iso().optional(),
  notas: Joi.string().trim().allow('', null).optional(),
  mascotaId: Joi.number().integer().positive().allow(null).optional(),
  veterinarioAsignadoId: Joi.number().integer().positive().allow(null).optional(),
  turnoId: Joi.number().integer().positive().allow(null).optional(),
  estado: Joi.string().valid('ACTIVO', 'FINALIZADO').optional()
});

module.exports = {
  COLUMNAS_VALIDAS,
  triageCreateSchema,
  triageMoverSchema,
  triageUpdateSchema
};

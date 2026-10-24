const Joi = require('joi');

const consultaCreateSchema = Joi.object({
  fecha: Joi.date().iso().optional(),
  subjetivo: Joi.string().trim().min(3).required().messages({
    'any.required': 'El campo Subjetivo (Anamnesis / motivo de consulta) es obligatorio',
    'string.empty': 'El campo Subjetivo no puede estar vacío',
    'string.min': 'El campo Subjetivo debe tener al menos 3 caracteres'
  }),
  objetivo: Joi.string().trim().min(3).required().messages({
    'any.required': 'El campo Objetivo (Examen físico / Constantes y hallazgos) es obligatorio',
    'string.empty': 'El campo Objetivo no puede estar vacío',
    'string.min': 'El campo Objetivo debe tener al menos 3 caracteres'
  }),
  peso: Joi.number().positive().min(0.01).max(300).required().messages({
    'any.required': 'El peso del paciente es obligatorio',
    'number.base': 'El peso debe ser un número válido en kg',
    'number.positive': 'El peso debe ser mayor a 0 kg',
    'number.min': 'El peso mínimo permitido es de 0.01 kg',
    'number.max': 'El peso máximo permitido es de 300 kg'
  }),
  temperatura: Joi.number().min(30).max(45).required().messages({
    'any.required': 'La temperatura corporal es obligatoria',
    'number.base': 'La temperatura debe ser un número válido en °C',
    'number.min': 'La temperatura debe ser de al menos 30 °C',
    'number.max': 'La temperatura no puede superar los 45 °C'
  }),
  frecuenciaCardiaca: Joi.number().integer().min(20).max(300).allow(null).optional().messages({
    'number.base': 'La frecuencia cardíaca debe ser un número entero (lpm)',
    'number.min': 'La frecuencia cardíaca debe ser de al menos 20 lpm',
    'number.max': 'La frecuencia cardíaca no puede superar 300 lpm'
  }),
  frecuenciaRespiratoria: Joi.number().integer().min(5).max(150).allow(null).optional().messages({
    'number.base': 'La frecuencia respiratoria debe ser un número entero (rpm)',
    'number.min': 'La frecuencia respiratoria debe ser de al menos 5 rpm',
    'number.max': 'La frecuencia respiratoria no puede superar 150 rpm'
  }),
  analisis: Joi.string().trim().min(3).required().messages({
    'any.required': 'El campo Análisis (Diagnóstico clínico) es obligatorio',
    'string.empty': 'El campo Análisis no puede estar vacío',
    'string.min': 'El campo Análisis debe tener al menos 3 caracteres'
  }),
  plan: Joi.string().trim().min(3).required().messages({
    'any.required': 'El campo Plan (Tratamiento e indicaciones) es obligatorio',
    'string.empty': 'El campo Plan no puede estar vacío',
    'string.min': 'El campo Plan debe tener al menos 3 caracteres'
  }),
  observaciones: Joi.string().trim().allow('', null).optional(),
  mascotaId: Joi.number().integer().positive().required().messages({
    'any.required': 'El identificador de la mascota es obligatorio',
    'number.base': 'El identificador de la mascota debe ser un número'
  }),
  turnoId: Joi.number().integer().positive().allow(null).optional()
});

const consultaUpdateSchema = Joi.object({
  motivoEdicion: Joi.string().trim().min(5).max(500).required().messages({
    'any.required': 'El motivo de edición es obligatorio para auditar la modificación médica',
    'string.empty': 'El motivo de edición no puede estar vacío',
    'string.min': 'El motivo de edición debe tener al menos 5 caracteres'
  }),
  subjetivo: Joi.string().trim().min(3).optional().messages({
    'string.empty': 'El campo Subjetivo no puede estar vacío',
    'string.min': 'El campo Subjetivo debe tener al menos 3 caracteres'
  }),
  objetivo: Joi.string().trim().min(3).optional().messages({
    'string.empty': 'El campo Objetivo no puede estar vacío',
    'string.min': 'El campo Objetivo debe tener al menos 3 caracteres'
  }),
  peso: Joi.number().positive().min(0.01).max(300).optional().messages({
    'number.base': 'El peso debe ser un número válido en kg',
    'number.positive': 'El peso debe ser mayor a 0 kg',
    'number.min': 'El peso mínimo permitido es de 0.01 kg',
    'number.max': 'El peso máximo permitido es de 300 kg'
  }),
  temperatura: Joi.number().min(30).max(45).optional().messages({
    'number.base': 'La temperatura debe ser un número válido en °C',
    'number.min': 'La temperatura debe ser de al menos 30 °C',
    'number.max': 'La temperatura no puede superar los 45 °C'
  }),
  frecuenciaCardiaca: Joi.number().integer().min(20).max(300).allow(null).optional().messages({
    'number.base': 'La frecuencia cardíaca debe ser un número entero (lpm)',
    'number.min': 'La frecuencia cardíaca debe ser de al menos 20 lpm',
    'number.max': 'La frecuencia cardíaca no puede superar 300 lpm'
  }),
  frecuenciaRespiratoria: Joi.number().integer().min(5).max(150).allow(null).optional().messages({
    'number.base': 'La frecuencia respiratoria debe ser un número entero (rpm)',
    'number.min': 'La frecuencia respiratoria debe ser de al menos 5 rpm',
    'number.max': 'La frecuencia respiratoria no puede superar 150 rpm'
  }),
  analisis: Joi.string().trim().min(3).optional().messages({
    'string.empty': 'El campo Análisis no puede estar vacío',
    'string.min': 'El campo Análisis debe tener al menos 3 caracteres'
  }),
  plan: Joi.string().trim().min(3).optional().messages({
    'string.empty': 'El campo Plan no puede estar vacío',
    'string.min': 'El campo Plan debe tener al menos 3 caracteres'
  }),
  observaciones: Joi.string().trim().allow('', null).optional()
});

const consultaAnulacionSchema = Joi.object({
  motivoAnulacion: Joi.string().trim().min(5).max(500).required().messages({
    'any.required': 'El motivo de anulación es obligatorio',
    'string.empty': 'El motivo de anulación no puede estar vacío',
    'string.min': 'El motivo de anulación debe tener al menos 5 caracteres'
  })
});

module.exports = {
  consultaCreateSchema,
  consultaUpdateSchema,
  consultaAnulacionSchema
};

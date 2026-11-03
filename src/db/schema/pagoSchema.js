const Joi = require('joi');

const pagoCreateSchema = Joi.object({
  monto: Joi.number().positive().precision(2).required(),
  concepto: Joi.string().trim().min(3).max(255).required(),
  metodo: Joi.string()
    .valid('transferencia', 'tarjeta', 'efectivo')
    .required(),
  estado: Joi.string()
    .valid('pendiente', 'aprobado', 'rechazado')
    .default('pendiente'),
  turnoId: Joi.number().integer().positive().allow(null).optional(),
  presupuestoId: Joi.number().integer().positive().allow(null).optional(),
  observaciones: Joi.string().allow('', null).optional()
}).custom((pago, helpers) => {
  const tieneTurno = pago.turnoId !== undefined && pago.turnoId !== null;
  const tienePresupuesto = pago.presupuestoId !== undefined && pago.presupuestoId !== null;

  if (!tieneTurno && !tienePresupuesto) {
    return helpers.error('any.custom');
  }

  return pago;
}, 'Validacion de asociacion del pago')
.messages({
  'any.custom': 'El pago debe estar asociado a un turno o a una orden de facturacion.'
});

module.exports = { pagoCreateSchema };

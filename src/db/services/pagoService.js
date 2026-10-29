const db = require('../models');
const { Pago, Turno, Mascota } = db;
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError
} = require('../utils/customErrors');

const normalizarRol = (usuario) =>
  String(usuario?.rol || '').toLowerCase().trim();

const esPersonal = (rol) =>
  ['profesional', 'veterinario', 'admin', 'recepcion'].includes(rol);

const pagoService = {
  getAll: async (usuario) => {
    const rol = normalizarRol(usuario);

    if (esPersonal(rol)) {
      return Pago.findAll({
        include: [{ model: Turno, as: 'turno' }],
        order: [['createdAt', 'DESC']]
      });
    }

    const turnos = await Turno.findAll({
      where: { usuarioId: usuario.id },
      attributes: ['id']
    });

    const idsTurnos = turnos.map((turno) => turno.id);

    return Pago.findAll({
      where: { turnoId: idsTurnos.length ? idsTurnos : null },
      include: [{ model: Turno, as: 'turno' }],
      order: [['createdAt', 'DESC']]
    });
  },

  create: async (datos, usuario) => {
    const rol = normalizarRol(usuario);
    const tieneTurno = datos.turnoId !== undefined;
    const tienePresupuesto = datos.presupuestoId !== undefined;

    if (tieneTurno === tienePresupuesto) {
      throw new BadRequestError(
        'El pago debe asociarse a un turno o a un presupuesto, pero no a ambos.'
      );
    }

    if (datos.estado && datos.estado !== 'pendiente' && !esPersonal(rol)) {
      throw new ForbiddenError(
        'Solo el personal autorizado puede definir el estado del pago.'
      );
    }

    if (tienePresupuesto) {
      throw new BadRequestError(
        'La gestión de pagos de presupuestos estará disponible cuando se implemente el módulo de presupuestos.'
      );
    }

    const turno = await Turno.findByPk(datos.turnoId, {
      include: [{ model: Mascota, as: 'mascota' }]
    });

    if (!turno) {
      throw new NotFoundError('El turno indicado no existe.');
    }

    if (!esPersonal(rol) && turno.usuarioId !== usuario.id) {
      throw new ForbiddenError(
        'No puedes registrar pagos para turnos de otro usuario.'
      );
    }

    const pago = await Pago.create({
      monto: datos.monto,
      concepto: datos.concepto,
      metodo: datos.metodo,
      estado: esPersonal(rol) ? (datos.estado || 'pendiente') : 'pendiente',
      turnoId: turno.id,
      presupuestoId: null,
      observaciones: datos.observaciones || null
    });

    return Pago.findByPk(pago.id, {
      include: [{ model: Turno, as: 'turno' }]
    });
  },

  getById: async (id, usuario) => {
    const pago = await Pago.findByPk(id, {
      include: [{ model: Turno, as: 'turno' }]
    });

    if (!pago) {
      throw new NotFoundError(`Pago con id ${id} no encontrado.`);
    }

    const rol = normalizarRol(usuario);

    if (
      !esPersonal(rol) &&
      (!pago.turno || pago.turno.usuarioId !== usuario.id)
    ) {
      throw new ForbiddenError(
        'No tienes permiso para consultar este pago.'
      );
    }

    return pago;
  },

  updateEstado: async (id, estado, usuario) => {
    const rol = normalizarRol(usuario);

    if (!esPersonal(rol)) {
      throw new ForbiddenError(
        'Solo el personal autorizado puede actualizar el estado de un pago.'
      );
    }

    const pago = await Pago.findByPk(id);

    if (!pago) {
      throw new NotFoundError(`Pago con id ${id} no encontrado.`);
    }

    await pago.update({ estado });

    return pago;
  }
};

module.exports = pagoService;

const { Op } = require('sequelize');
const db = require('../models');
const { Pago, Turno, Mascota, Usuario, Consulta, OrdenFacturacion } = db;
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError
} = require('../utils/customErrors');

const normalizarRol = (usuario) => {
  if (!usuario) return '';
  if (typeof usuario.rol === 'object' && usuario.rol?.nombre) {
    return usuario.rol.nombre.toLowerCase().trim();
  }
  return String(usuario.rol || usuario.role || '').toLowerCase().trim();
};

const esPersonal = (rol) =>
  ['profesional', 'admin', 'recepcion'].includes(rol);

const pagoService = {
  getAll: async (usuario) => {
    const rol = normalizarRol(usuario);

    if (esPersonal(rol)) {
      return Pago.findAll({
        include: [{
          model: Turno,
          as: 'turno',
          include: [
            { model: Mascota, as: 'mascota' },
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
            }
          ]
        }],
        order: [['createdAt', 'DESC']]
      });
    }

    const turnos = await Turno.findAll({
      where: { usuarioId: usuario.id },
      attributes: ['id']
    });
    const idsTurnos = turnos.map((turno) => turno.id);

    const mascotas = await Mascota.findAll({
      where: { usuarioId: usuario.id },
      attributes: ['id']
    });
    const idsMascotas = mascotas.map((m) => m.id);

    let idsOrdenes = [];
    if (idsMascotas.length > 0 && OrdenFacturacion && Consulta) {
      const ordenesCliente = await OrdenFacturacion.findAll({
        include: [{
          model: Consulta,
          as: 'consulta',
          where: { mascotaId: idsMascotas },
          required: true
        }],
        attributes: ['id']
      });
      idsOrdenes = ordenesCliente.map((o) => o.id);
    }

    const condiciones = [];
    if (idsTurnos.length > 0) {
      condiciones.push({ turnoId: idsTurnos });
    }
    if (idsOrdenes.length > 0) {
      condiciones.push({ presupuestoId: idsOrdenes });
    }

    if (condiciones.length === 0) {
      return [];
    }

    return Pago.findAll({
      where: { [Op.or]: condiciones },
      include: [{ model: Turno, as: 'turno' }],
      order: [['createdAt', 'DESC']]
    });
  },

  create: async (datos, usuario) => {
    const rol = normalizarRol(usuario);
    const tieneTurno = datos.turnoId !== undefined && datos.turnoId !== null;
    const tienePresupuesto = datos.presupuestoId !== undefined && datos.presupuestoId !== null;

    if (!tieneTurno && !tienePresupuesto) {
      throw new BadRequestError(
        'El pago debe asociarse a un turno o a una orden de facturacion.'
      );
    }

    if (datos.estado && datos.estado !== 'pendiente' && !esPersonal(rol)) {
      throw new ForbiddenError(
        'Solo el personal autorizado puede definir el estado del pago.'
      );
    }

    let turnoIdFinal = tieneTurno ? Number(datos.turnoId) : null;
    let presupuestoIdFinal = tienePresupuesto ? Number(datos.presupuestoId) : null;

    if (tienePresupuesto && OrdenFacturacion) {
      const orden = await OrdenFacturacion.findByPk(presupuestoIdFinal, {
        include: [{
          model: Consulta,
          as: 'consulta',
          include: [{ model: Mascota, as: 'mascota' }]
        }]
      });

      if (!orden) {
        throw new NotFoundError('La orden de facturacion indicada no existe.');
      }

      if (!esPersonal(rol) && orden.consulta?.mascota?.usuarioId !== usuario.id) {
        throw new ForbiddenError(
          'No puedes registrar pagos para ordenes de facturacion de otro usuario.'
        );
      }

      if (!turnoIdFinal && orden.consulta?.turnoId) {
        turnoIdFinal = orden.consulta.turnoId;
      }
    }

    if (turnoIdFinal) {
      const turno = await Turno.findByPk(turnoIdFinal, {
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

      if (!presupuestoIdFinal && Consulta && OrdenFacturacion) {
        const consultaTurno = await Consulta.findOne({
          where: { turnoId: turno.id }
        });
        if (consultaTurno) {
          const ordenTurno = await OrdenFacturacion.findOne({
            where: { consultaId: consultaTurno.id }
          });
          if (ordenTurno) {
            presupuestoIdFinal = ordenTurno.id;
          }
        }
      }
    }

    const estadoInicial = esPersonal(rol) ? (datos.estado || 'pendiente') : 'pendiente';

    const pago = await Pago.create({
      monto: datos.monto,
      concepto: datos.concepto,
      metodo: datos.metodo,
      estado: estadoInicial,
      turnoId: turnoIdFinal,
      presupuestoId: presupuestoIdFinal,
      observaciones: datos.observaciones || null
    });

    if (estadoInicial === 'aprobado' && presupuestoIdFinal && OrdenFacturacion) {
      const orden = await OrdenFacturacion.findByPk(presupuestoIdFinal);
      if (orden && orden.estado === 'pendiente') {
        await orden.update({ estado: 'pagada' });
      }
    }

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

    if (!esPersonal(rol)) {
      let autorizado = Boolean(pago.turno && pago.turno.usuarioId === usuario.id);
      if (!autorizado && pago.presupuestoId && OrdenFacturacion) {
        const orden = await OrdenFacturacion.findByPk(pago.presupuestoId, {
          include: [{
            model: Consulta,
            as: 'consulta',
            include: [{ model: Mascota, as: 'mascota' }]
          }]
        });
        if (orden?.consulta?.mascota?.usuarioId === usuario.id) {
          autorizado = true;
        }
      }

      if (!autorizado) {
        throw new ForbiddenError(
          'No tienes permiso para consultar este pago.'
        );
      }
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

    if (estado === 'aprobado' && OrdenFacturacion) {
      let ordenVinculada = null;

      if (pago.presupuestoId) {
        ordenVinculada = await OrdenFacturacion.findByPk(pago.presupuestoId);
      }

      if (!ordenVinculada && pago.turnoId && Consulta) {
        const consultaTurno = await Consulta.findOne({
          where: { turnoId: pago.turnoId }
        });
        if (consultaTurno) {
          ordenVinculada = await OrdenFacturacion.findOne({
            where: { consultaId: consultaTurno.id }
          });
        }
      }

      if (ordenVinculada && ordenVinculada.estado === 'pendiente') {
        await ordenVinculada.update({ estado: 'pagada' });
      }
    }

    return pago;
  }
};

module.exports = pagoService;

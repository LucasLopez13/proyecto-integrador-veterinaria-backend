
const db = require('../models');
const {Prescripcion,Consulta,Usuario} = db;

const {NotFoundError,ForbiddenError,BadRequestError} = require('../utils/customErrors');

const prescripcionService = {
  create: async (datos, usuario) => {
    const consulta = await Consulta.findByPk(datos.consultaId);
    if (!consulta) {
      throw new NotFoundError(
        `Consulta con id ${datos.consultaId} no encontrada`
      );
    }

    const rol = String(usuario.rol?.nombre || '').toUpperCase();
    if (
      rol !== 'ADMIN' &&
      consulta.veterinarioId !== usuario.id
    ) {
      throw new ForbiddenError(
        'Solo el profesional responsable de la consulta puede crear prescripciones'
      );
    }

    const pesoKg = Number(consulta.peso);
    const dosisIndicada = Number(datos.dosisIndicada);
    const concentracion = Number(datos.concentracion);
    let dosisTotal = null;
    let volumenMl = null;
    const unidadDosis = datos.unidadDosis.trim().toLowerCase();
    const unidadConcentracion =
      datos.unidadConcentracion.trim().toLowerCase();

    if (unidadDosis === 'mg/kg') {
      dosisTotal = dosisIndicada * pesoKg;

      if (unidadConcentracion === 'mg/ml') {
        volumenMl = dosisTotal / concentracion;
      }
    }

    return await Prescripcion.create({
      medicamento: datos.medicamento,
      concentracion,
      unidadConcentracion: datos.unidadConcentracion,
      dosisIndicada,
      unidadDosis: datos.unidadDosis,
      pesoKg,
      dosisTotal,
      volumenMl,
      consultaId: consulta.id,
      confirmadaPorProfesional: false,
      fechaConfirmacion: null,
      confirmadoPorId: null
    });
  },

  getByConsultaId: async (consultaId, usuario) => {
    const consulta = await Consulta.findByPk(consultaId);
    if (!consulta) {
      throw new NotFoundError(
        `Consulta con id ${consultaId} no encontrada`
      );
    }
    const rol = String(usuario.rol?.nombre || '').toUpperCase();
    if (
      rol === 'CLIENTE' &&
      consulta.mascotaId
    ) {
      const mascota = await db.Mascota.findByPk(consulta.mascotaId);

      if (!mascota || mascota.usuarioId !== usuario.id) {
        throw new ForbiddenError(
          'No tienes permisos para consultar estas prescripciones'
        );
      }
    }

    return await Prescripcion.findAll({
      where: { consultaId },
      include: [
        {
          model: Usuario,
          as: 'profesionalConfirmante',
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  },

  confirm: async (id, usuario) => {
    const prescripcion = await Prescripcion.findByPk(id, {
      include: [{
        model: Consulta,
        as: 'consulta'
      }]
    });

    if (!prescripcion) {
      throw new NotFoundError(
        `Prescripción con id ${id} no encontrada`
      );
    }
    const rol = String(usuario.rol?.nombre || '').toUpperCase();
    const esAdmin = rol === 'ADMIN';

    if (
      !esAdmin &&
      prescripcion.consulta.veterinarioId !== usuario.id
    ) {
      throw new ForbiddenError(
        'Solo el profesional responsable de la consulta puede confirmar esta prescripcion'
      );
    }

    if (prescripcion.confirmadaPorProfesional) {
      throw new BadRequestError(
        'Esta prescripción ya fue confirmada'
      );
    }

    await prescripcion.update({
      confirmadaPorProfesional: true,
      fechaConfirmacion: new Date(),
      confirmadoPorId: usuario.id
    });

    return prescripcion;
  }
};

module.exports = prescripcionService;

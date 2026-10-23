
const db = require('../models');
const { Mascota, Consulta } = db;
const { NotFoundError, ForbiddenError } = require('./customErrors');

const getRole = (usuario) => {
    const nombre = usuario?.rol?.nombre || usuario?.rol || '';
    return String(nombre).toLowerCase().trim();
};

const verificarAccesoMascota = async (
    mascotaId,
    usuario,
    { soloProfesional = false } = {}
) => {
    const rol = getRole(usuario);

    if (!usuario || !usuario.id) {
        throw new ForbiddenError('Usuario no autenticado');
    }

    if (
        soloProfesional &&
        rol !== 'profesional' &&
        rol !== 'admin'
    ) {
        throw new ForbiddenError(
            'Solo un profesional o administrador puede realizar esta operacion'
        );
    }

    const mascota = await Mascota.findByPk(mascotaId);

    if (!mascota) {
        throw new NotFoundError(
            `Mascota con id ${mascotaId} no encontrada`
        );
    }

    if (rol === 'admin') {
        return mascota;
    }

    if (rol === 'cliente' && !soloProfesional) {
        if (Number(mascota.usuarioId) === Number(usuario.id)) {
            return mascota;
        }

        throw new NotFoundError(
            `Mascota con id ${mascotaId} no encontrada`
        );
    }

    if (rol === 'profesional') {
        const consulta = await Consulta.findOne({
            where: {
                mascotaId: mascota.id,
                veterinarioId: usuario.id
            }
        });

        if (consulta) {
            return mascota;
        }

        throw new NotFoundError(
            `Mascota con id ${mascotaId} no encontrada`
        );
    }

    throw new ForbiddenError(
        'No tienes permisos para acceder a esta mascota'
    );
};

module.exports = { verificarAccesoMascota };

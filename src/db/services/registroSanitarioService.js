const db = require('../models');
const { Op } = require('sequelize');
const { RegistroSanitario, Mascota,Consulta } = db;
const { NotFoundError,ForbiddenError } = require('../utils/customErrors');
const { verificarAccesoMascota } = require('../utils/mascotaAcces');

const getRole = (usuario) => {
    const nombre = usuario?.rol?.nombre || usuario?.rol || '';
    return String(nombre).toLowerCase().trim();
};

const registroSanitarioService = {

    create: async ({ tipo, nombre, lote, fechaAplicacion, fechaRefuerzoEstimada, mascotaId }, usuario) => {
        const mascota = await verificarAccesoMascota(
            mascotaId,
            usuario,
            { soloProfesional: true }
        );

        const registro = await RegistroSanitario.create({
            tipo,
            nombre,
            lote,
            fechaAplicacion,
            fechaRefuerzoEstimada,
            mascotaId: mascota.id
        });
        return registro.toJSON(); 
    },
    getAll: async (usuario) => {
        const rol = getRole(usuario);

        if (rol === 'admin') {
            return await RegistroSanitario.findAll({
                include: [{ model: Mascota, as: 'mascota' }],
                order: [['fechaAplicacion', 'DESC']]
            });
        }

        if (rol === 'cliente') {
            return await RegistroSanitario.findAll({
                include: [{
                    model: Mascota,
                    as: 'mascota',
                    where: { usuarioId: usuario.id }
                }],
                order: [['fechaAplicacion', 'DESC']]
            });
        }

        if (rol === 'profesional') {
            const consultas = await Consulta.findAll({
                where: { veterinarioId: usuario.id },
                attributes: ['mascotaId'],
                raw: true
            });
            const mascotaIds = [
                ...new Set(consultas.map(c => c.mascotaId))
            ];

            if (mascotaIds.length === 0) {
                return [];
            }
            return await RegistroSanitario.findAll({
                where: {
                    mascotaId: { [Op.in]: mascotaIds }
                },
                include: [{ model: Mascota, as: 'mascota' }],
                order: [['fechaAplicacion', 'DESC']]
            });
        }
        throw new ForbiddenError(
            'No tienes permisos para consultar registros sanitarios'
        );
    },
    getById: async (id, usuario) => {
        const registro = await RegistroSanitario.findByPk(id, {
            include: [{ model: Mascota, as: 'mascota' }]
        });

        if (!registro) {
            throw new NotFoundError(
                `Registro sanitario con id ${id} no encontrado`
            );
        }

        await verificarAccesoMascota(
            registro.mascotaId,
            usuario
        );
        return registro.toJSON();
    },
    getByMascota: async (mascotaId, usuario) => {
        const mascota = await verificarAccesoMascota(
            mascotaId,
            usuario
        );
        return await RegistroSanitario.findAll({
            where: { mascotaId: mascota.id },
            include: [{ model: Mascota, as: 'mascota' }],
            order: [['fechaAplicacion', 'DESC']]
        });
    },
    update: async (id, usuario, datos) => {
        const registro = await RegistroSanitario.findByPk(id);

        if (!registro) {
            throw new NotFoundError(
                `Registro sanitario con id ${id} no encontrado`
            );
        }
        await verificarAccesoMascota(
            registro.mascotaId,
            usuario,
            { soloProfesional: true }
        );

        const camposPermitidos = [
            'tipo',
            'nombre',
            'lote',
            'fechaAplicacion',
            'fechaRefuerzoEstimada'
        ];
        const datosPermitidos = {};
        for (const campo of camposPermitidos) {
            if (datos[campo] !== undefined) {
                datosPermitidos[campo] = datos[campo];
            }
        }
        await registro.update(datosPermitidos);
        return registro.toJSON();
    },
    delete: async (id, usuario) => {
        const registro = await RegistroSanitario.findByPk(id);
        if (!registro) {
            throw new NotFoundError(
                `Registro sanitario con id ${id} no encontrado`
            );
        }
        await verificarAccesoMascota(
            registro.mascotaId,
            usuario,
            { soloProfesional: true }
        );
        await registro.destroy();
        return {
            message: 'Registro sanitario eliminado correctamente'
        };
    }

};

module.exports = registroSanitarioService;
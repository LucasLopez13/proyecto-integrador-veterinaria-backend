const crypto = require('crypto');
const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

const { CarnetVacunacion, Mascota, RegistroSanitario } = db;

const carnetVacunacionService = {
    obtenerOCrear: async (mascotaId, usuario) => {
        const { verificarAccesoMascota } = require('../utils/mascotaAcces');

        const mascota = await verificarAccesoMascota(mascotaId, usuario);

        let carnet = await CarnetVacunacion.findOne({
            where: { mascotaId: mascota.id }
        });

        if (!carnet) {
            carnet = await CarnetVacunacion.create({
                mascotaId: mascota.id,
                token: crypto.randomUUID()
            });
        }

        return {
            mascotaId: mascota.id,
            token: carnet.token
        };
    },


    consultarPublico: async (token) => {
        if (
            typeof token !== 'string' ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)
        ) {
            throw new BadRequestError('El token del carnet no es válido');
        }

        const carnet = await CarnetVacunacion.findOne({
            where: { token },
            include: [
                {
                    model: Mascota,
                    as: 'mascota',
                    attributes: ['id', 'nombre', 'especie', 'raza', 'sexo']
                }
            ]
        });


        if (!carnet || !carnet.mascota) {
            throw new NotFoundError('Carnet de vacunación no encontrado');
        }

        const registros = await RegistroSanitario.findAll({
            where: {
                mascotaId: carnet.mascota.id,
                tipo: 'vacuna'
            },
            attributes: [
                'nombre',
                'fechaAplicacion',
                'fechaRefuerzoEstimada'
            ],
            order: [['fechaAplicacion', 'DESC']]
        });

        return {
            mascota: carnet.mascota,
            vacunas: registros
        };
    }
};

module.exports = carnetVacunacionService;

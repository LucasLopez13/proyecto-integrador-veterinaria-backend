const archivoMedicoService = require('../services/archivoMedicoService');
const path = require('path');

const archivoMedicoController = {

    getFile: async (req, res, next) => {
        try {
            const archivo = await archivoMedicoService.getFile(
                req.params.id,
                req.user.id
            );

            const rutaArchivo = path.resolve(archivo.ruta);

            res.sendFile(rutaArchivo, {
                headers: {
                    'Content-Type': archivo.tipo,
                    'Content-Disposition': 'inline'
                }
            });
        } catch (error) {
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        try {
            const archivos = await archivoMedicoService.getAll(req.user.id);

            res.status(200).json(archivos);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const archivo = await archivoMedicoService.getById(
                req.params.id,
                req.user.id
            );

            res.status(200).json(archivo);
        } catch (error) {
            next(error);
        }
    },

    getByMascota: async (req, res, next) => {
        try {
            const archivos = await archivoMedicoService.getByMascota(
                req.params.mascotaId,
                req.user.id
            );

            res.status(200).json(archivos);
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: 'Debe adjuntar un archivo médico'
                });
            }

            const archivo = await archivoMedicoService.create(
                {
                    nombre: req.body.nombre || req.file.originalname,
                    nombreArchivo: req.file.filename,
                    tipo: req.file.mimetype,
                    ruta: req.file.path,
                    mascotaId: req.body.mascotaId
                },
                req.user.id
            );

            res.status(201).json(archivo);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const resultado = await archivoMedicoService.delete(
                req.params.id,
                req.user.id
            );

            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = archivoMedicoController;

const db = require('../models');
const { Op } = require('sequelize');

const {
    Servicio,
    Producto,
    Consulta,
    ConceptoConsulta,
    OrdenFacturacion
} = db;

const {
    NotFoundError,
    BadRequestError,
    ConflictError,
    ForbiddenError
} = require('../utils/customErrors');

// ==========================================
// VALIDAR ACCESO A UNA CONSULTA
// ==========================================

const validarAccesoConsulta = (consulta, usuario) => {
    const rol = String(usuario.rol || usuario.role || '').toLowerCase();

    if (rol === 'admin' || rol === 'recepcion') {
        return;
    }

    if (rol === 'profesional' || rol === 'veterinario') {
        if (Number(consulta.veterinarioId) !== Number(usuario.id)) {
            throw new ForbiddenError(
                'No tenés permiso para acceder a esta consulta'
            );
        }

        return;
    }

    throw new ForbiddenError(
        'No tenés permiso para realizar esta operación'
    );
};

// ==========================================
// SERVICIO DE FACTURACION
// ==========================================

const facturacionService = {

    // ==========================================
    // CATALOGO DE SERVICIOS
    // ==========================================

    listarServicios: async (incluirInactivos = false) => {
        return await Servicio.findAll({
            where: incluirInactivos ? {} : { activo: true },
            order: [['nombre', 'ASC']]
        });
    },

    listarProductos: async () => {
        return await Producto.findAll({
            attributes: ['id', 'nombre', 'precioUnitario', 'stockActual'],
            order: [['nombre', 'ASC']]
        });
    },

    crearServicio: async (datos) => {
        const nombre = datos.nombre?.trim();
        const precio = Number(datos.precioUnitario);

        if (!nombre || nombre.length < 2) {
            throw new BadRequestError(
                'El nombre debe tener al menos 2 caracteres'
            );
        }

        if (!Number.isFinite(precio) || precio < 0) {
            throw new BadRequestError(
                'El precio debe ser mayor o igual a cero'
            );
        }

        return await Servicio.create({
            nombre,
            descripcion: datos.descripcion?.trim() || null,
            precioUnitario: precio,
            activo: true
        });
    },

    actualizarServicio: async (id, datos) => {
        const servicio = await Servicio.findByPk(id);

        if (!servicio) {
            throw new NotFoundError('Servicio no encontrado');
        }

        const cambios = {};

        if (datos.nombre !== undefined) {
            const nombre = datos.nombre.trim();

            if (nombre.length < 2) {
                throw new BadRequestError(
                    'El nombre debe tener al menos 2 caracteres'
                );
            }

            cambios.nombre = nombre;
        }

        if (datos.descripcion !== undefined) {
            cambios.descripcion = datos.descripcion?.trim() || null;
        }

        if (datos.precioUnitario !== undefined) {
            const precio = Number(datos.precioUnitario);

            if (!Number.isFinite(precio) || precio < 0) {
                throw new BadRequestError(
                    'El precio debe ser mayor o igual a cero'
                );
            }

            cambios.precioUnitario = precio;
        }

        if (datos.activo !== undefined) {
            if (typeof datos.activo !== 'boolean') {
                throw new BadRequestError(
                    'El estado debe ser verdadero o falso'
                );
            }

            cambios.activo = datos.activo;
        }

        await servicio.update(cambios);

        return servicio;
    },

    cambiarEstadoServicio: async (id, activo) => {
        const servicio = await Servicio.findByPk(id);

        if (!servicio) {
            throw new NotFoundError('Servicio no encontrado');
        }

        if (typeof activo !== 'boolean') {
            throw new BadRequestError(
                'El estado debe ser verdadero o falso'
            );
        }

        await servicio.update({ activo });

        return servicio;
    },

    // ==========================================
    // CONCEPTOS DE LA CONSULTA
    // ==========================================

    agregarConceptoConsulta: async (consultaId, datos, usuario) => {
        const consulta = await Consulta.findByPk(consultaId);

        if (!consulta) {
            throw new NotFoundError('Consulta no encontrada');
        }

        validarAccesoConsulta(consulta, usuario);

        // No permitir cambios si ya se genero la orden.
        const ordenExistente = await OrdenFacturacion.findOne({
            where: { consultaId }
        });

        if (ordenExistente) {
            throw new ConflictError(
                'No se pueden modificar los conceptos porque la consulta ya tiene una orden de facturación'
            );
        }

        const tieneServicio =
            datos.servicioId !== undefined &&
            datos.servicioId !== null;

        const tieneProducto =
            datos.productoId !== undefined &&
            datos.productoId !== null;

        if (tieneServicio === tieneProducto) {
            throw new BadRequestError(
                'Debe indicar un servicio o un producto, pero no ambos'
            );
        }

        const cantidad = Number(datos.cantidad ?? 1);

        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            throw new BadRequestError(
                'La cantidad debe ser mayor a cero'
            );
        }

        if (tieneServicio) {
            const servicio = await Servicio.findByPk(datos.servicioId);

            if (!servicio || !servicio.activo) {
                throw new NotFoundError(
                    'El servicio no existe o está inactivo'
                );
            }
        }

        if (tieneProducto) {
            const producto = await Producto.findByPk(datos.productoId);

            if (!producto) {
                throw new NotFoundError('El producto no existe');
            }

            // No se modifica el stock en esta operación.
        }

        return await ConceptoConsulta.create({
            consultaId: Number(consultaId),
            servicioId: tieneServicio ? Number(datos.servicioId) : null,
            productoId: tieneProducto ? Number(datos.productoId) : null,
            cantidad,
            observaciones: datos.observaciones?.trim() || null
        });
    },

    listarConceptosConsulta: async (consultaId, usuario) => {
        const consulta = await Consulta.findByPk(consultaId);

        if (!consulta) {
            throw new NotFoundError('Consulta no encontrada');
        }

        validarAccesoConsulta(consulta, usuario);

        return await ConceptoConsulta.findAll({
            where: { consultaId },
            include: [
                { model: Servicio, as: 'servicio' },
                { model: Producto, as: 'producto' }
            ],
            order: [['createdAt', 'ASC']]
        });
    },

    eliminarConceptoConsulta: async (consultaId, conceptoId, usuario) => {
        const consulta = await Consulta.findByPk(consultaId);

        if (!consulta) {
            throw new NotFoundError('Consulta no encontrada');
        }

        validarAccesoConsulta(consulta, usuario);

        const ordenExistente = await OrdenFacturacion.findOne({
            where: { consultaId }
        });

        if (ordenExistente) {
            throw new ConflictError(
                'No se pueden eliminar conceptos de una consulta facturada'
            );
        }

        const concepto = await ConceptoConsulta.findOne({
            where: {
                id: conceptoId,
                consultaId
            }
        });

        if (!concepto) {
            throw new NotFoundError('Concepto no encontrado');
        }

        await concepto.destroy();

        return {
            message: 'Concepto eliminado correctamente'
        };
    },

    // ==========================================
    // LISTAR ORDENES DE FACTURACION
    // ==========================================

    listarOrdenesFacturacion: async () => {
        return await OrdenFacturacion.findAll({
            include: [
                {
                    model: db.DetalleOrdenFacturacion,
                    as: 'detalles'
                },
                {
                    model: Consulta,
                    as: 'consulta',
                    include: [
                        { model: db.Mascota, as: 'mascota' },
                        { model: db.Usuario, as: 'veterinario' }
                    ]
                },
                {
                    model: db.Usuario,
                    as: 'generadaPor'
                }
            ],
            order: [['fechaGeneracion', 'DESC']]
        });
    },

    // ==========================================
    // OBTENER UNA ORDEN POR ID
    // ==========================================

    obtenerOrdenFacturacion: async (id) => {
        const orden = await OrdenFacturacion.findByPk(id, {
            include: [
                {
                    model: db.DetalleOrdenFacturacion,
                    as: 'detalles'
                },
                {
                    model: Consulta,
                    as: 'consulta',
                    include: [
                        { model: db.Mascota, as: 'mascota' },
                        { model: db.Usuario, as: 'veterinario' }
                    ]
                },
                {
                    model: db.Usuario,
                    as: 'generadaPor'
                }
            ]
        });

        if (!orden) {
            throw new NotFoundError(
                'Orden de facturación no encontrada'
            );
        }

        return orden;
    },

    // ==========================================
    // CONSULTAS PENDIENTES DE FACTURACION
    // ==========================================

    listarConsultasPendientesFacturacion: async () => {
        const ordenes = await OrdenFacturacion.findAll({
            attributes: ['consultaId']
        });

        const consultasFacturadas = ordenes.map(
            (orden) => orden.consultaId
        );

        const where = {};

        // Evita el NOT IN vacío, que puede producir resultados incorrectos.
        if (consultasFacturadas.length > 0) {
            where.id = {
                [Op.notIn]: consultasFacturadas
            };
        }

        return await Consulta.findAll({
            where,
            include: [
                {
                    model: db.Mascota,
                    as: 'mascota'
                },
                {
                    model: ConceptoConsulta,
                    as: 'conceptosFacturacion',
                    required: true
                }
            ],
            order: [['fecha', 'DESC']]
        });
    },

    // ==========================================
    // GENERAR ORDEN DE FACTURACION
    // ==========================================

    generarOrdenFacturacion: async (consultaId, usuario) => {
        try {
            return await db.sequelize.transaction(async (transaction) => {
                const consulta = await Consulta.findByPk(consultaId, {
                    transaction
                });

                if (!consulta) {
                    throw new NotFoundError('Consulta no encontrada');
                }

                const ordenExistente = await OrdenFacturacion.findOne({
                    where: { consultaId },
                    transaction
                });

                if (ordenExistente) {
                    throw new ConflictError(
                        'Esta consulta ya tiene una orden de facturación'
                    );
                }

                const conceptos = await ConceptoConsulta.findAll({
                    where: { consultaId },
                    include: [
                        { model: Servicio, as: 'servicio' },
                        { model: Producto, as: 'producto' }
                    ],
                    transaction
                });

                if (conceptos.length === 0) {
                    throw new BadRequestError(
                        'No se puede generar una orden sin conceptos de facturación'
                    );
                }

                let totalCentavos = 0;
                const detalles = [];

                for (const concepto of conceptos) {
                    const tieneServicio = concepto.servicioId !== null;
                    const tieneProducto = concepto.productoId !== null;

                    if (tieneServicio === tieneProducto) {
                        throw new BadRequestError(
                            'Existe un concepto con un servicio o producto inválido'
                        );
                    }

                    const referencia = tieneServicio
                        ? concepto.servicio
                        : concepto.producto;

                    if (!referencia) {
                        throw new BadRequestError(
                            'No se encontró el servicio o producto de un concepto'
                        );
                    }

                    if (tieneServicio && !referencia.activo) {
                        throw new BadRequestError(
                            `El servicio ${referencia.nombre} está inactivo`
                        );
                    }

                    const cantidad = Number(concepto.cantidad);
                    const precio = Number(referencia.precioUnitario);

                    if (
                        !Number.isFinite(cantidad) ||
                        cantidad <= 0 ||
                        !Number.isFinite(precio) ||
                        precio < 0
                    ) {
                        throw new BadRequestError(
                            'Hay cantidades o precios inválidos en los conceptos'
                        );
                    }

                    const precioCentavos = Math.round(precio * 100);

                    const subtotalCentavos = Math.round(
                        precioCentavos * cantidad
                    );

                    totalCentavos += subtotalCentavos;

                    detalles.push({
                        servicioId: tieneServicio ? referencia.id : null,
                        productoId: tieneProducto ? referencia.id : null,
                        descripcion: referencia.nombre,
                        cantidad,
                        precioUnitario: (precioCentavos / 100).toFixed(2),
                        subtotal: (subtotalCentavos / 100).toFixed(2)
                    });
                }

                const orden = await OrdenFacturacion.create(
                    {
                        consultaId: consulta.id,
                        generadaPorId: usuario.id,
                        fechaGeneracion: new Date(),
                        total: (totalCentavos / 100).toFixed(2),
                        estado: 'pendiente'
                    },
                    { transaction }
                );

                const detallesConOrden = detalles.map((detalle) => ({
                    ...detalle,
                    ordenFacturacionId: orden.id
                }));

                await db.DetalleOrdenFacturacion.bulkCreate(
                    detallesConOrden,
                    { transaction }
                );

                return await OrdenFacturacion.findByPk(orden.id, {
                    include: [
                        {
                            model: db.DetalleOrdenFacturacion,
                            as: 'detalles'
                        },
                        {
                            model: Consulta,
                            as: 'consulta'
                        }
                    ],
                    transaction
                });
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new ConflictError(
                    'Esta consulta ya tiene una orden de facturación'
                );
            }

            throw error;
        }
    }

};

module.exports = facturacionService;

const { Op } = require('sequelize');
const db = require('../models');

const { Producto, Lote } = db;

const alertaStockService = {
    getAll: async ({ diasVencimiento = 30 } = {}) => {
        const dias = Number(diasVencimiento);

        if (!Number.isInteger(dias) || dias < 0 || dias > 365) {
            const { BadRequestError } = require('../utils/customErrors');
            throw new BadRequestError(
                'Los días para alertar vencimientos deben ser un entero entre 0 y 365'
            );
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const limite = new Date(hoy);
        limite.setDate(limite.getDate() + dias);

        const todosLosProductos = await Producto.findAll({
            order: [['stockActual', 'ASC']]
        });

        const productos = todosLosProductos.filter(
            (producto) =>
                Number(producto.stockActual) <= Number(producto.alertaStockMinimo)
        );

        const lotes = await Lote.findAll({
            where: {
                fechaVencimiento: {
                    [Op.lte]: limite.toISOString().slice(0, 10)
                },
                stockActual: {
                    [Op.gt]: 0
                }
            },
            include: [
                {
                    model: Producto,
                    as: 'producto',
                    attributes: [
                        'id',
                        'nombre',
                        'unidadMedida',
                        'stockActual',
                        'alertaStockMinimo'
                    ]
                }
            ],
            order: [['fechaVencimiento', 'ASC']]
        });

        const alertasStock = productos.map((producto) => ({
            tipo: 'STOCK_CRITICO',
            nivel: Number(producto.stockActual) === 0 ? 'CRITICO' : 'ADVERTENCIA',
            productoId: producto.id,
            producto: producto.nombre,
            stockActual: producto.stockActual,
            stockMinimo: producto.alertaStockMinimo,
            unidadMedida: producto.unidadMedida,
            mensaje: Number(producto.stockActual) === 0
                ? `El producto ${producto.nombre} no tiene stock disponible`
                : `El producto ${producto.nombre} alcanzó su stock mínimo`
        }));

        const alertasVencimiento = lotes.map((lote) => {
            const fechaVencimiento = String(lote.fechaVencimiento).slice(0, 10);
            const vencido = fechaVencimiento < hoy.toISOString().slice(0, 10);

            return {
                tipo: vencido ? 'PRODUCTO_VENCIDO' : 'PROXIMO_A_VENCER',
                nivel: vencido ? 'CRITICO' : 'ADVERTENCIA',
                loteId: lote.id,
                numeroLote: lote.numeroLote,
                productoId: lote.productoId,
                producto: lote.producto?.nombre,
                fechaVencimiento,
                stockActual: lote.stockActual,
                unidadMedida: lote.producto?.unidadMedida,
                mensaje: vencido
                    ? `El lote ${lote.numeroLote} está vencido`
                    : `El lote ${lote.numeroLote} está próximo a vencer`
            };
        });

        return {
            total: alertasStock.length + alertasVencimiento.length,
            diasVencimiento: dias,
            alertas: [...alertasStock, ...alertasVencimiento]
        };
    }
};

module.exports = alertaStockService;
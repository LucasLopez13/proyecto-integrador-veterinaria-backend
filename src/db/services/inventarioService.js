const { Op } = require('sequelize');
const db = require('../models');
const { Producto, Lote, MovimientoStock, TipoMovimientoStock, Usuario, Consulta } = db;
const { BadRequestError, NotFoundError } = require('../utils/customErrors');

const inventarioService = {
  getProductosConLotes: async () => {
    const productos = await Producto.findAll({
      order: [['nombre', 'ASC']],
      include: [
        {
          model: Lote,
          as: 'lotes',
          where: {
            stockActual: {
              [Op.gt]: 0
            }
          },
          required: false,
          order: [['fechaVencimiento', 'ASC']]
        }
      ]
    });

    return productos.map((p) => {
      const prodJson = p.toJSON();
      const hoyStr = new Date().toISOString().slice(0, 10);
      prodJson.lotesDisponibles = (prodJson.lotes || []).filter(
        (l) => l.fechaVencimiento >= hoyStr && Number(l.stockActual) > 0
      );
      return prodJson;
    });
  },

  registrarConsumo: async (
    { productoId, loteId, cantidad, consultaId, observaciones },
    usuario,
    transaccionExterna = null
  ) => {
    const cantNum = Number(cantidad);
    if (!cantNum || isNaN(cantNum) || cantNum <= 0) {
      throw new BadRequestError('La cantidad consumida debe ser un numero mayor a cero.');
    }

    const ejecutarOperacion = async (t) => {
      let [tipoMov] = await TipoMovimientoStock.findOrCreate({
        where: { codigo: 'CONSUMO_CLINICO' },
        defaults: {
          codigo: 'CONSUMO_CLINICO',
          nombre: 'Consumo clinico en atencion medica',
          esSuma: false
        },
        transaction: t
      });

      const producto = await Producto.findByPk(productoId, {
        transaction: t,
        lock: t.LOCK ? t.LOCK.UPDATE : undefined
      });
      if (!producto) {
        throw new NotFoundError(`Producto con id ${productoId} no encontrado.`);
      }

      const lote = await Lote.findByPk(loteId, {
        transaction: t,
        lock: t.LOCK ? t.LOCK.UPDATE : undefined
      });
      if (!lote) {
        throw new NotFoundError(`Lote con id ${loteId} no encontrado.`);
      }

      if (Number(lote.productoId) !== Number(producto.id)) {
        throw new BadRequestError('El lote seleccionado no corresponde al producto indicado.');
      }

      const hoyStr = new Date().toISOString().slice(0, 10);
      if (lote.fechaVencimiento < hoyStr) {
        throw new BadRequestError(
          `El lote ${lote.numeroLote} se encuentra vencido desde ${lote.fechaVencimiento} y no puede ser administrado.`
        );
      }

      const stockLoteActual = Number(lote.stockActual);
      if (stockLoteActual < cantNum) {
        throw new BadRequestError(
          `Stock insuficiente en el lote ${lote.numeroLote}. Disponible: ${stockLoteActual} ${producto.unidadMedida}, solicitado: ${cantNum} ${producto.unidadMedida}.`
        );
      }

      const stockProdActual = Number(producto.stockActual);
      if (stockProdActual < cantNum) {
        throw new BadRequestError(
          `Stock insuficiente a nivel producto. Disponible: ${stockProdActual} ${producto.unidadMedida}, solicitado: ${cantNum} ${producto.unidadMedida}.`
        );
      }

      const nuevoStockLote = Number((stockLoteActual - cantNum).toFixed(4));
      const nuevoStockProd = Number((stockProdActual - cantNum).toFixed(4));

      await lote.update({ stockActual: nuevoStockLote }, { transaction: t });
      await producto.update({ stockActual: nuevoStockProd }, { transaction: t });

      const movimiento = await MovimientoStock.create(
        {
          productoId: producto.id,
          loteId: lote.id,
          tipoMovimientoId: tipoMov.id,
          usuarioId: usuario.id,
          consultaId: consultaId || null,
          cantidad: cantNum,
          observaciones:
            observaciones ||
            `Consumo fraccionado de ${cantNum} ${producto.unidadMedida} del lote ${lote.numeroLote}`
        },
        { transaction: t }
      );

      const alertaCritica = nuevoStockProd <= Number(producto.alertaStockMinimo);

      return {
        movimiento,
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          unidadMedida: producto.unidadMedida,
          stockAnterior: stockProdActual,
          stockActual: nuevoStockProd,
          alertaStockMinimo: producto.alertaStockMinimo,
          alertaCritica
        },
        lote: {
          id: lote.id,
          numeroLote: lote.numeroLote,
          stockAnterior: stockLoteActual,
          stockActual: nuevoStockLote,
          fechaVencimiento: lote.fechaVencimiento
        },
        cantidadConsumida: cantNum
      };
    };

    if (transaccionExterna) {
      return await ejecutarOperacion(transaccionExterna);
    } else {
      return await db.sequelize.transaction(async (t) => {
        return await ejecutarOperacion(t);
      });
    }
  },

  getMovimientosByConsulta: async (consultaId) => {
    return await MovimientoStock.findAll({
      where: { consultaId },
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre', 'unidadMedida', 'principioActivo']
        },
        {
          model: Lote,
          as: 'lote',
          attributes: ['id', 'numeroLote', 'fechaVencimiento']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  },

  getHistorialMovimientos: async (limite = 50) => {
    return await MovimientoStock.findAll({
      limit: Number(limite) || 50,
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre', 'unidadMedida', 'stockActual']
        },
        {
          model: Lote,
          as: 'lote',
          attributes: ['id', 'numeroLote', 'fechaVencimiento', 'stockActual']
        },
        {
          model: TipoMovimientoStock,
          as: 'tipoMovimiento',
          attributes: ['id', 'codigo', 'nombre', 'esSuma']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Consulta,
          as: 'consulta',
          attributes: ['id', 'fecha', 'mascotaId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
};

module.exports = inventarioService;

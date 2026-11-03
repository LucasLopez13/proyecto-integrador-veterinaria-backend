'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DetalleOrdenFacturacion extends Model {
    static associate(models) {
      DetalleOrdenFacturacion.belongsTo(models.OrdenFacturacion, {
        foreignKey: 'ordenFacturacionId',
        as: 'orden'
      });

      DetalleOrdenFacturacion.belongsTo(models.Servicio, {
        foreignKey: 'servicioId',
        as: 'servicio'
      });

      DetalleOrdenFacturacion.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto'
      });
    }
  }

  DetalleOrdenFacturacion.init(
    {
      ordenFacturacionId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      servicioId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false
      },
      cantidad: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 0.01
        }
      },
      precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      }
    },
    {
      sequelize,
      modelName: 'DetalleOrdenFacturacion',
      tableName: 'detalles_orden_facturacion',
      timestamps: true
    }
  );

  return DetalleOrdenFacturacion;
};
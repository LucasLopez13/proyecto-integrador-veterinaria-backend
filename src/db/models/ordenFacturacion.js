'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrdenFacturacion extends Model {
    static associate(models) {
      OrdenFacturacion.belongsTo(models.Consulta, {
        foreignKey: 'consultaId',
        as: 'consulta'
      });

      OrdenFacturacion.belongsTo(models.Usuario, {
        foreignKey: 'generadaPorId',
        as: 'generadaPor'
      });

      OrdenFacturacion.hasMany(models.DetalleOrdenFacturacion, {
        foreignKey: 'ordenFacturacionId',
        as: 'detalles'
      });
    }
  }

  OrdenFacturacion.init(
    {
      consultaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      generadaPorId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fechaGeneracion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'pagada', 'anulada'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      metodoPago: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fechaPago: {
        type: DataTypes.DATE,
        allowNull: true
      },
      comprobante: {
        type: DataTypes.STRING,
        allowNull: true
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'OrdenFacturacion',
      tableName: 'ordenes_facturacion',
      timestamps: true
    }
  );

  return OrdenFacturacion;
};
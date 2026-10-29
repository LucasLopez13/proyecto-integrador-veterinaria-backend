 'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      Producto.hasMany(models.Lote, {
        foreignKey: 'productoId',
        as: 'lotes'
      });

      Producto.hasMany(models.MovimientoStock, {
        foreignKey: 'productoId',
        as: 'movimientos'
      });
    }
  }

  Producto.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 150]
        }
      },
      principioActivo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      concentracion: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      unidadMedida: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      stockActual: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      alertaStockMinimo: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 5,
        validate: {
          min: 0
        }
      },
      precioUnitario: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      }
    },
    {
      sequelize,
      modelName: 'Producto',
      tableName: 'productos',
      paranoid: true,
      timestamps: true
    }
  );

  return Producto;
};
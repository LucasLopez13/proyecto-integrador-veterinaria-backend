'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Lote extends Model {
    static associate(models) {
      Lote.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto'
      });

      Lote.hasMany(models.MovimientoStock, {
        foreignKey: 'loteId',
        as: 'movimientos'
      });
    }
  }

  Lote.init(
    {
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      numeroLote: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      fechaVencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      stockInicial: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      stockActual: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 0
        }
      }
    },
    {
      sequelize,
      modelName: 'Lote',
      tableName: 'lotes',
      paranoid: true,
      timestamps: true
    }
  );

  return Lote;
};
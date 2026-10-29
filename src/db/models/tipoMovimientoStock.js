'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoMovimientoStock extends Model {
    static associate(models) {
      TipoMovimientoStock.hasMany(models.MovimientoStock, {
        foreignKey: 'tipoMovimientoId',
        as: 'movimientos'
      });
    }
  }

  TipoMovimientoStock.init(
    {
      codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      esSuma: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'TipoMovimientoStock',
      tableName: 'tipos_movimiento_stock',
      paranoid: true,
      timestamps: true
    }
  );

  return TipoMovimientoStock;
};
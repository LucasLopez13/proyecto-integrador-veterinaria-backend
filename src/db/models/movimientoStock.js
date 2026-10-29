'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MovimientoStock extends Model {
    static associate(models) {
      MovimientoStock.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto'
      });

      MovimientoStock.belongsTo(models.Lote, {
        foreignKey: 'loteId',
        as: 'lote'
      });

      MovimientoStock.belongsTo(models.TipoMovimientoStock, {
        foreignKey: 'tipoMovimientoId',
        as: 'tipoMovimiento'
      });

      MovimientoStock.belongsTo(models.Usuario, {
        foreignKey: 'usuarioId',
        as: 'usuario'
      });

      MovimientoStock.belongsTo(models.Consulta, {
        foreignKey: 'consultaId',
        as: 'consulta'
      });
    }
  }

  MovimientoStock.init(
    {
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      loteId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      tipoMovimientoId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      consultaId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      cantidad: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notEqual: 0
        }
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'MovimientoStock',
      tableName: 'movimientos_stock',
      paranoid: true,
      timestamps: true
    }
  );

  return MovimientoStock;
};
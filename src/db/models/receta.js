'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Receta extends Model {
    static associate(models) {
      Receta.belongsTo(models.Consulta, {
        foreignKey: 'consultaId',
        as: 'consulta'
      });

      Receta.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto'
      });
    }
  }

  Receta.init(
    {
      consultaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      dosis: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      frecuencia: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      duracion: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      indicaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Receta',
      tableName: 'recetas',
      timestamps: true,
      paranoid: true
    }
  );

  return Receta;
};
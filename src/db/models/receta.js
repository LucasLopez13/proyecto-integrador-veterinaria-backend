'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Receta extends Model {
    static associate(models) {
      Receta.belongsTo(models.Mascota, {
        foreignKey: 'mascotaId',
        as: 'mascota'
      });

      Receta.belongsTo(models.Usuario, {
        foreignKey: 'profesionalId',
        as: 'profesional'
      });
    }
  }

  Receta.init(
    {
      fecha: {
        type: DataTypes.DATE,
        allowNull: false
      },
      medicamento: {
        type: DataTypes.STRING,
        allowNull: false
      },
      indicaciones: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      estado: {
        type: DataTypes.STRING,
        defaultValue: 'activo',
        allowNull: false
      },
      mascotaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      profesionalId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Receta',
      tableName: 'recetas'
    }
  );

  return Receta;
};
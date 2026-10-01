'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Consulta extends Model {
    static associate(models) {
      Consulta.belongsTo(models.Mascota, {
        foreignKey: 'mascotaId',
        as: 'mascota'
      });

      Consulta.belongsTo(models.Usuario, {
        foreignKey: 'profesionalId',
        as: 'profesional'
      });
    }
  }

  Consulta.init(
    {
      fecha: {
        type: DataTypes.DATE,
        allowNull: false
      },
      diagnostico: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subjetivo: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      objetivo: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      evaluacion: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      plan: {
        type: DataTypes.TEXT,
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
      modelName: 'Consulta',
      tableName: 'consultas'
    }
  );

  return Consulta;
};
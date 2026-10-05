'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Consulta extends Model {
    static associate(models) {
      Consulta.belongsTo(models.Mascota, { foreignKey: 'mascotaId', as: 'mascota' });
      Consulta.belongsTo(models.Usuario, { foreignKey: 'veterinarioId', as: 'veterinario' });
      Consulta.belongsTo(models.Turno, { foreignKey: 'turnoId', as: 'turno' });
    }
  }

  Consulta.init(
    {
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      subjetivo: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      objetivo: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      peso: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      temperatura: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      frecuenciaCardiaca: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      frecuenciaRespiratoria: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      analisis: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      plan: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      mascotaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      veterinarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      turnoId: {
        type: DataTypes.INTEGER,
        allowNull: true
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

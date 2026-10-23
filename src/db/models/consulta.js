'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Consulta extends Model {
    static associate(models) {
      Consulta.belongsTo(models.Mascota, { foreignKey: 'mascotaId', as: 'mascota' });
      Consulta.belongsTo(models.Usuario, { foreignKey: 'veterinarioId', as: 'veterinario' });
      Consulta.belongsTo(models.Turno, { foreignKey: 'turnoId', as: 'turno' });
      Consulta.hasMany(models.Prescripcion, {foreignKey: 'consultaId',as: 'prescripciones'});
      Consulta.hasMany(models.VersionConsulta, {foreignKey: 'consultaId',as: 'versiones'});
    }
  }

  Consulta.init(
    {
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
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
      tableName: 'consultas',
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeDestroy: (instance, options) => {
          if (options && options.force) {
            throw new Error('Prohibición estricta de borrados físicos sobre registros médicos (solo soft delete permitido)');
          }
        }
      }
    }
  );

  return Consulta;
};

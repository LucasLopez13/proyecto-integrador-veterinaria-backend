'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VersionConsulta extends Model {
    static associate(models) {
      VersionConsulta.belongsTo(models.Consulta, {
        foreignKey: 'consultaId',
        as: 'consulta'
      });
      VersionConsulta.belongsTo(models.Usuario, {
        foreignKey: 'autorId',
        as: 'autor'
      });
    }
  }

  VersionConsulta.init(
    {
      consultaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      numeroVersion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      autorId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tipoAccion: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'CREACION_INICIAL'
      },
      motivoEdicion: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      valoresAnteriores: {
        type: DataTypes.JSON,
        allowNull: true
      },
      valoresModificados: {
        type: DataTypes.JSON,
        allowNull: true
      },
      datosCompletosSnapshot: {
        type: DataTypes.JSON,
        allowNull: false
      },
      hashSha256: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fechaVersion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'VersionConsulta',
      tableName: 'versiones_consultas',
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

  return VersionConsulta;
};

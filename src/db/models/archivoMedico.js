'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ArchivoMedico extends Model {
    static associate(models) {
      ArchivoMedico.belongsTo(models.Mascota, {
        foreignKey: 'mascotaId',
        as: 'mascota'
      });
    }
  }

  ArchivoMedico.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },

      nombreArchivo: {
        type: DataTypes.STRING,
        allowNull: false
      },

      tipo: {
        type: DataTypes.STRING,
        allowNull: false
      },

      ruta: {
        type: DataTypes.STRING,
        allowNull: false
      },

      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },

      mascotaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'ArchivoMedico',
      tableName: 'archivos_medicos'
    }
  );

  return ArchivoMedico;
};
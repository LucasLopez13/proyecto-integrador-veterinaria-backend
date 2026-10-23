'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Triage extends Model {
    static associate(models) {
      Triage.belongsTo(models.Mascota, {
        foreignKey: 'mascotaId',
        as: 'mascota'
      });
      Triage.belongsTo(models.Usuario, {
        foreignKey: 'veterinarioAsignadoId',
        as: 'veterinarioAsignado'
      });
      Triage.belongsTo(models.Turno, {
        foreignKey: 'turnoId',
        as: 'turno'
      });
    }
  }

  Triage.init(
    {
      columna: {
        type: DataTypes.ENUM(
          'EMERGENCIA_CRITICA',
          'URGENCIA_MODERADA',
          'CONSULTA_PROGRAMADA',
          'INTERNACION_QUIROFANO'
        ),
        allowNull: false,
        defaultValue: 'URGENCIA_MODERADA'
      },
      nombrePaciente: {
        type: DataTypes.STRING,
        allowNull: false
      },
      especie: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Canino'
      },
      raza: {
        type: DataTypes.STRING,
        allowNull: true
      },
      nombreTutor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      telefonoTutor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      motivo: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      fechaLlegada: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      notas: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ACTIVO' // 'ACTIVO', 'FINALIZADO'
      },
      mascotaId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      veterinarioAsignadoId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      turnoId: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Triage',
      tableName: 'triages',
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeDestroy: (instance, options) => {
          if (options && options.force) {
            throw new Error('Prohibición estricta de borrados físicos sobre registros médicos (solo soft delete)');
          }
        }
      }
    }
  );

  return Triage;
};

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Mascota extends Model {
    static associate(models) {
      Mascota.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'dueno' });
      Mascota.hasMany(models.Turno, { foreignKey: 'mascotaId', as: 'turnos' });
    }
  }

  Mascota.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      especie: {
        type: DataTypes.STRING,
        allowNull: false
      },
      raza: {
        type: DataTypes.STRING,
        allowNull: true
      },
      edad: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      sexo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Mascota',
      tableName: 'mascotas'
    }
  );

  return Mascota;
};

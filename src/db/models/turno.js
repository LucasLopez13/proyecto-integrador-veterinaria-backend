'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Turno extends Model {
    static associate(models) {
      Turno.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      Turno.belongsTo(models.Mascota, { foreignKey: 'mascotaId', as: 'mascota' });
    }
  }

  Turno.init(
    {
      fecha: {
        type: DataTypes.DATE,
        allowNull: false
      },
      motivo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      estado: {
        type: DataTypes.STRING,
        defaultValue: 'pendiente'
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      mascotaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Turno',
      tableName: 'turnos'
    }
  );

  return Turno;
};

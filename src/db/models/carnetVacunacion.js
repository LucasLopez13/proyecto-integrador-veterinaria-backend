
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CarnetVacunacion extends Model {
    static associate(models) {
      CarnetVacunacion.belongsTo(models.Mascota, {
        foreignKey: 'mascotaId',
        as: 'mascota'
      });
    }
  }

  CarnetVacunacion.init(
    {
      token: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: DataTypes.UUIDV4
      },
      mascotaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'mascotas',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'CarnetVacunacion',
      tableName: 'carnets_vacunacion',
      timestamps: true
    }
  );

  return CarnetVacunacion;
};

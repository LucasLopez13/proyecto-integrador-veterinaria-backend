'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RegistroSanitario extends Model {
    static associate(models) {
      RegistroSanitario.belongsTo(models.Mascota, {foreignKey: 'mascotaId',as: 'mascota'});
    }
  }

  RegistroSanitario.init(
    {
      tipo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lote: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fechaAplicacion: {
        type: DataTypes.DATE,
        allowNull: false
      },
      fechaRefuerzoEstimada: {
        type: DataTypes.DATE,
        allowNull: true
      },
      mascotaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },

    {
      sequelize,
      modelName: 'RegistroSanitario',
      tableName: 'registros_sanitarios'
    }

  );

  return RegistroSanitario;

};
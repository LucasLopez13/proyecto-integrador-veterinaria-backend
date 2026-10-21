
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Prescripcion extends Model {
    static associate(models) {
      Prescripcion.belongsTo(models.Consulta, {
        foreignKey: 'consultaId',
        as: 'consulta'
      });

      Prescripcion.belongsTo(models.Usuario, {
        foreignKey: 'confirmadoPorId',
        as: 'profesionalConfirmante'
      });
    }
  }

  Prescripcion.init(
    {
      medicamento: {
        type: DataTypes.STRING,
        allowNull: false
      },
      concentracion: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      unidadConcentracion: {
        type: DataTypes.STRING,
        allowNull: false
      },
      dosisIndicada: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      unidadDosis: {
        type: DataTypes.STRING,
        allowNull: false
      },
      pesoKg: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      dosisTotal: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      volumenMl: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      confirmadaPorProfesional: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fechaConfirmacion: {
        type: DataTypes.DATE,
        allowNull: true
      },
      consultaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      confirmadoPorId: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Prescripcion',
      tableName: 'prescripciones',
      paranoid: true,
      timestamps: true
    }
  );

  return Prescripcion;
};

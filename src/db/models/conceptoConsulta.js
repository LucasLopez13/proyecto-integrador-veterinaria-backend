'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ConceptoConsulta extends Model {
    static associate(models) {
      ConceptoConsulta.belongsTo(models.Consulta, {
        foreignKey: 'consultaId',
        as: 'consulta'
      });

      ConceptoConsulta.belongsTo(models.Servicio, {
        foreignKey: 'servicioId',
        as: 'servicio'
      });

      ConceptoConsulta.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto'
      });
    }
  }

  ConceptoConsulta.init(
    {
      consultaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      servicioId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      cantidad: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 0.01
        }
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'ConceptoConsulta',
      tableName: 'conceptos_consulta',
      timestamps: true
    }
  );

  return ConceptoConsulta;
};
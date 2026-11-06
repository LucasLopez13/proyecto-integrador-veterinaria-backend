'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Servicio extends Model {
    static associate(models) {
      Servicio.hasMany(models.ConceptoConsulta, {
        foreignKey: 'servicioId',
        as: 'conceptosConsulta'
      });

      Servicio.hasMany(models.DetalleOrdenFacturacion, {
        foreignKey: 'servicioId',
        as: 'detallesFacturacion'
      });
    }
  }

  Servicio.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 150]
        }
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Servicio',
      tableName: 'servicios',
      paranoid: true,
      timestamps: true
    }
  );

  return Servicio;
};
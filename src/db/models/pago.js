'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pago extends Model {
    static associate(models) {
      Pago.belongsTo(models.Turno, {
        foreignKey: 'turnoId',
        as: 'turno'
      });
    }
  }

  Pago.init(
    {
      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01
        }
      },
      concepto: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 255]
        }
      },
      metodo: {
        type: DataTypes.ENUM('transferencia', 'tarjeta', 'efectivo'),
        allowNull: false
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      turnoId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      presupuestoId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Pago',
      tableName: 'pagos',
      timestamps: true
    }
  );

  return Pago;
};

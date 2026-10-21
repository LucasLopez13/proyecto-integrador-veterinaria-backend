'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    static associate(models) {
      Rol.hasMany(models.Usuario, { foreignKey: 'rolId', as: 'usuarios' });
    }
  }

  Rol.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Rol',
      tableName: 'roles',
      paranoid: true,
      timestamps: true
    }
  );

  return Rol;
};

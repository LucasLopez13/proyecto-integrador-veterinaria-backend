
'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.hasMany(models.Mascota, {
        foreignKey: 'usuarioId',
        as: 'mascotas'
      });

      Usuario.hasMany(models.Turno, {
        foreignKey: 'usuarioId',
        as: 'turnos'
      });

      Usuario.hasMany(models.Consulta, {
        foreignKey: 'veterinarioId',
        as: 'consultasRealizadas'
      });
    }

    async validarPassword(passwordPlana) {
      return bcrypt.compare(passwordPlana, this.password);
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;

      if (values.rol) {
        values.rol = String(values.rol).toLowerCase();
      }

      return values;
    }
  }

  Usuario.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rol: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cliente'
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    paranoid: false,
    hooks: {
      beforeCreate: async usuario => {
        if (usuario.password) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      },
      beforeUpdate: async usuario => {
        if (usuario.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      }
    }
  });

  return Usuario;
};

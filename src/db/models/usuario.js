'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    async validarPassword(passwordIngresada) {
      return bcrypt.compare(passwordIngresada, this.password);
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;

      if (values.rol && typeof values.rol === 'object' && values.rol.nombre) {
        values.role = values.rol.nombre.toLowerCase();
      }

      return values;
    }

    static associate(models) {
      Usuario.belongsTo(models.Rol, {
        foreignKey: 'rolId',
        as: 'rol'
      });

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

      Usuario.hasMany(models.Receta, {
        foreignKey: 'profesionalId',
        as: 'recetas'
      });
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
    rolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'roles',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    paranoid: false,
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.password) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      }
    }
  });

  return Usuario;
};

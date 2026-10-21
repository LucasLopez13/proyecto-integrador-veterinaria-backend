const db = require('../models');
const { Usuario, Mascota, Turno, Rol } = db;
const { NotFoundError, ConflictError } = require('../utils/customErrors');

const usuarioService = {
  getAll: async () => {
    return await Usuario.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Rol, as: 'rol' }]
    });
  },

  getById: async (id) => {
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Rol, as: 'rol' },
        { model: Mascota, as: 'mascotas' },
        { model: Turno, as: 'turnos' }
      ]
    });

    if (!usuario) {
      throw new NotFoundError(`Usuario con id ${id} no encontrado`);
    }

    return usuario;
  },

  create: async ({ nombre, apellido, email, password, telefono, rol, rolId }) => {
    const emailNormalizado = email.toLowerCase().trim();

    const existe = await Usuario.findOne({ where: { email: emailNormalizado } });
    if (existe) {
      throw new ConflictError('El correo electrónico ingresado ya se encuentra registrado');
    }

    let rolIdFinal = rolId;
    if (!rolIdFinal && rol) {
      const rolBuscado = await Rol.findOne({
        where: db.Sequelize.where(
          db.Sequelize.fn('UPPER', db.Sequelize.col('nombre')),
          rol.toUpperCase().trim()
        )
      });
      if (rolBuscado) {
        rolIdFinal = rolBuscado.id;
      }
    }

    if (!rolIdFinal) {
      const rolCliente = await Rol.findOne({
        where: db.Sequelize.where(
          db.Sequelize.fn('UPPER', db.Sequelize.col('nombre')),
          'CLIENTE'
        )
      });
      rolIdFinal = rolCliente ? rolCliente.id : 1;
    }

    const usuario = await Usuario.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: emailNormalizado,
      password,
      telefono: telefono ? telefono.trim() : null,
      rolId: rolIdFinal
    });

    const usuarioConRol = await Usuario.findByPk(usuario.id, {
      include: [{ model: Rol, as: 'rol' }]
    });

    return (usuarioConRol || usuario).toJSON();
  },

  update: async (id, datosActualizados) => {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new NotFoundError(`Usuario con id ${id} no encontrado`);
    }

    const { nombre, apellido, email, password, telefono, rol, rolId } = datosActualizados;

    if (email && email.toLowerCase().trim() !== usuario.email) {
      const emailNormalizado = email.toLowerCase().trim();
      const existe = await Usuario.findOne({ where: { email: emailNormalizado } });
      if (existe) {
        throw new ConflictError('El correo electrónico ingresado ya está en uso');
      }
      usuario.email = emailNormalizado;
    }

    if (nombre) usuario.nombre = nombre.trim();
    if (apellido) usuario.apellido = apellido.trim();
    if (telefono !== undefined) usuario.telefono = telefono ? telefono.trim() : null;
    if (rolId) usuario.rolId = rolId;
    if (password) usuario.password = password;

    if (rol && !rolId) {
      const rolBuscado = await Rol.findOne({
        where: db.Sequelize.where(
          db.Sequelize.fn('UPPER', db.Sequelize.col('nombre')),
          rol.toUpperCase().trim()
        )
      });
      if (rolBuscado) {
        usuario.rolId = rolBuscado.id;
      }
    }

    await usuario.save();

    const usuarioConRol = await Usuario.findByPk(usuario.id, {
      include: [{ model: Rol, as: 'rol' }]
    });

    return (usuarioConRol || usuario).toJSON();
  },

  delete: async (id) => {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new NotFoundError(`Usuario con id ${id} no encontrado`);
    }

    await usuario.destroy();
    return { message: 'Usuario eliminado exitosamente' };
  }
};

module.exports = usuarioService;

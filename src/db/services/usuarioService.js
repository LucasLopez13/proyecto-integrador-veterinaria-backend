const db = require('../models');
const { Usuario, Mascota, Turno } = db;
const { NotFoundError, ConflictError } = require('../utils/customErrors');

const usuarioService = {
  getAll: async () => {
    return await Usuario.findAll({
      attributes: { exclude: ['password'] }
    });
  },

  getById: async (id) => {
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Mascota, as: 'mascotas' },
        { model: Turno, as: 'turnos' }
      ]
    });

    if (!usuario) {
      throw new NotFoundError(`Usuario con id ${id} no encontrado`);
    }

    return usuario;
  },

  create: async ({ nombre, apellido, email, password, telefono, rol }) => {
    const emailNormalizado = email.toLowerCase().trim();

    const existe = await Usuario.findOne({ where: { email: emailNormalizado } });
    if (existe) {
      throw new ConflictError('El correo electrónico ingresado ya se encuentra registrado');
    }

    const usuario = await Usuario.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: emailNormalizado,
      password,
      telefono: telefono ? telefono.trim() : null,
      rol: rol || 'cliente'
    });

    return usuario.toJSON();
  },

  update: async (id, datosActualizados) => {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new NotFoundError(`Usuario con id ${id} no encontrado`);
    }

    const { nombre, apellido, email, password, telefono, rol } = datosActualizados;

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
    if (rol) usuario.rol = rol;
    if (password) usuario.password = password;

    await usuario.save();

    return usuario.toJSON();
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

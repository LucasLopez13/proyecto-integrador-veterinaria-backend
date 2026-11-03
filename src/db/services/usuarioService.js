const db = require('../models');
const { Usuario, Mascota, Turno, Rol } = db;
const { NotFoundError, ConflictError } = require('../utils/customErrors');

const resolverRolId = async (rol) => {
  if (!rol) return 1;
  if (typeof rol === 'number') return rol;
  const nombre = String(rol).trim().toUpperCase();
  const rolDb = await Rol.findOne({ where: { nombre } });
  return rolDb ? rolDb.id : 1;
};

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

    const existe = await Usuario.findOne({
      where: { email: emailNormalizado }
    });

    if (existe) {
      throw new ConflictError(
        'El correo electronico ingresado ya se encuentra registrado'
      );
    }

    const finalRolId = rolId || (rol ? await resolverRolId(rol) : 1);

    const usuario = await Usuario.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: emailNormalizado,
      password,
      telefono: telefono ? telefono.trim() : null,
      rolId: finalRolId
    });

    const usuarioConRol = await Usuario.findByPk(usuario.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Rol, as: 'rol' }]
    });

    return usuarioConRol.toJSON();
  },

  update: async (id, datosActualizados) => {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new NotFoundError(`Usuario con id ${id} no encontrado`);
    }

    const { nombre, apellido, email, password, telefono, rol, rolId } = datosActualizados;

    if (email && email.toLowerCase().trim() !== usuario.email) {
      const emailNormalizado = email.toLowerCase().trim();

      const existe = await Usuario.findOne({
        where: { email: emailNormalizado }
      });

      if (existe) {
        throw new ConflictError(
          'El correo electronico ingresado ya esta en uso'
        );
      }

      usuario.email = emailNormalizado;
    }

    if (nombre !== undefined) usuario.nombre = nombre.trim();
    if (apellido !== undefined) usuario.apellido = apellido.trim();

    if (telefono !== undefined) {
      usuario.telefono = telefono ? telefono.trim() : null;
    }

    if (rolId !== undefined) {
      usuario.rolId = rolId;
    } else if (rol !== undefined) {
      usuario.rolId = await resolverRolId(rol);
    }

    if (password) {
      usuario.password = password;
    }

    await usuario.save();

    const usuarioConRol = await Usuario.findByPk(usuario.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Rol, as: 'rol' }]
    });

    return usuarioConRol.toJSON();
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

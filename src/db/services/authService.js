const jwt = require('jsonwebtoken');
const db = require('../models');
const { Usuario, Rol } = db;
const { ConflictError, UnauthorizedError } = require('../utils/customErrors');

const generateToken = (usuario) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  const rolNombre = typeof usuario.rol === 'object' && usuario.rol?.nombre
    ? usuario.rol.nombre.toLowerCase()
    : String(usuario.rol || 'cliente').toLowerCase();

  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: rolNombre,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    },
    secret,
    { expiresIn }
  );
};

const authService = {
  register: async ({ nombre, apellido, email, password, telefono, rol, rolId }) => {
    const emailNormalizado = email.toLowerCase().trim();

    const usuarioExistente = await Usuario.findOne({ where: { email: emailNormalizado } });
    if (usuarioExistente) {
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

    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: emailNormalizado,
      password,
      telefono: telefono ? telefono.trim() : null,
      rolId: rolIdFinal
    });

    const usuarioConRol = await Usuario.findByPk(nuevoUsuario.id, {
      include: [{ model: Rol, as: 'rol' }]
    });

    const token = generateToken(usuarioConRol || nuevoUsuario);

    return {
      message: 'Usuario registrado exitosamente',
      user: (usuarioConRol || nuevoUsuario).toJSON(),
      token
    };
  },

  login: async ({ email, password }) => {
    const emailNormalizado = email.toLowerCase().trim();

    const usuario = await Usuario.findOne({
      where: { email: emailNormalizado },
      include: [{ model: Rol, as: 'rol' }]
    });

    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas, intente nuevamente');
    }

    const passwordValida = await usuario.validarPassword(password);
    if (!passwordValida) {
      throw new UnauthorizedError('Credenciales inválidas, intente nuevamente');
    }

    const token = generateToken(usuario);

    return {
      message: 'Inicio de sesión exitoso',
      user: usuario.toJSON(),
      token
    };
  }
};

module.exports = authService;

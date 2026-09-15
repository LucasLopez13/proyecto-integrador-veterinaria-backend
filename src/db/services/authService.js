const jwt = require('jsonwebtoken');
const db = require('../models');
const { Usuario } = db;
const { ConflictError, UnauthorizedError } = require('../utils/customErrors');

const generateToken = (usuario) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    },
    secret,
    { expiresIn }
  );
};

const authService = {
  register: async ({ nombre, apellido, email, password, telefono, rol }) => {
    const emailNormalizado = email.toLowerCase().trim();

    const usuarioExistente = await Usuario.findOne({ where: { email: emailNormalizado } });
    if (usuarioExistente) {
      throw new ConflictError('El correo electrónico ingresado ya se encuentra registrado');
    }

    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: emailNormalizado,
      password,
      telefono: telefono ? telefono.trim() : null,
      rol: rol || 'cliente'
    });

    const token = generateToken(nuevoUsuario);

    return {
      message: 'Usuario registrado exitosamente',
      user: nuevoUsuario.toJSON(),
      token
    };
  },

  login: async ({ email, password }) => {
    const emailNormalizado = email.toLowerCase().trim();

    const usuario = await Usuario.findOne({ where: { email: emailNormalizado } });
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

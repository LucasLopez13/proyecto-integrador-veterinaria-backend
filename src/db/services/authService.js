const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { ConflictError, UnauthorizedError } = require('../utils/customErrors');

const normalizarRol = (rol) => {
  const nombre = String(rol || 'cliente').toLowerCase().trim();
  return nombre === 'veterinario' ? 'profesional' : nombre;
};

const generateToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: normalizarRol(usuario.rol),
      nombre: usuario.nombre,
      apellido: usuario.apellido
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const authService = {
  register: async ({ nombre, apellido, email, password, telefono }) => {
    const emailNormalizado = email.toLowerCase().trim();

    const usuarioExistente = await Usuario.findOne({
      where: { email: emailNormalizado }
    });

    if (usuarioExistente) {
      throw new ConflictError('El correo electrónico ingresado ya se encuentra registrado');
    }

    // El registro público no debe permitir elegir el rol profesional.
    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: emailNormalizado,
      password,
      telefono: telefono ? telefono.trim() : null,
      rol: 'cliente'
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

    const usuario = await Usuario.findOne({
      where: { email: emailNormalizado }
    });

    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas, intente nuevamente');
    }

    const passwordValida = await usuario.validarPassword(password);

    if (!passwordValida) {
      throw new UnauthorizedError('Credenciales inválidas, intente nuevamente');
    }

    return {
      message: 'Inicio de sesión exitoso',
      user: usuario.toJSON(),
      token: generateToken(usuario)
    };
  }
};

module.exports = authService;

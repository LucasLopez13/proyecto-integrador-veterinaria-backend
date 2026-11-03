const jwt = require('jsonwebtoken');
const db = require('../models');
const { Usuario, Rol } = db;
const { ConflictError, UnauthorizedError } = require('../utils/customErrors');

const normalizarRol = (usuario) => {
  const rolVal = usuario?.rol?.nombre || usuario?.rol || '';
  return String(rolVal || 'cliente').toLowerCase().trim();
};

const resolverRolId = async (rol, rolId) => {
  if (rolId) return Number(rolId);
  if (!rol) return 1;
  if (typeof rol === 'number') return rol;
  const nombre = String(rol).trim().toUpperCase();
  const rolDb = await Rol.findOne({ where: { nombre } });
  return rolDb ? rolDb.id : 1;
};

const generateToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: normalizarRol(usuario),
      nombre: usuario.nombre,
      apellido: usuario.apellido
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const authService = {
  register: async ({ nombre, apellido, email, password, telefono, rol, rolId }) => {
    const emailNormalizado = email.toLowerCase().trim();

    const usuarioExistente = await Usuario.findOne({
      where: { email: emailNormalizado }
    });

    if (usuarioExistente) {
      throw new ConflictError('El correo electronico ingresado ya se encuentra registrado');
    }

    const finalRolId = await resolverRolId(rol, rolId);

    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: emailNormalizado,
      password,
      telefono: telefono ? telefono.trim() : null,
      rolId: finalRolId
    });

    const usuarioConRol = await Usuario.findByPk(nuevoUsuario.id, {
      include: [{ model: Rol, as: 'rol' }]
    });

    const token = generateToken(usuarioConRol);

    return {
      message: 'Usuario registrado exitosamente',
      user: usuarioConRol.toJSON(),
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
      throw new UnauthorizedError('Credenciales invalidas, intente nuevamente');
    }

    const passwordValida = await usuario.validarPassword(password);

    if (!passwordValida) {
      throw new UnauthorizedError('Credenciales invalidas, intente nuevamente');
    }

    return {
      message: 'Inicio de sesion exitoso',
      user: usuario.toJSON(),
      token: generateToken(usuario)
    };
  }
};

module.exports = authService;


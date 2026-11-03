const jwt = require('jsonwebtoken');
const db = require('../models');
const { Usuario, Rol } = db;

const normalizarRol = (rol) => {
  const nombre = typeof rol === 'object' && rol?.nombre
    ? rol.nombre
    : String(rol || '');

  return nombre.toLowerCase().trim();
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Acceso no autorizado: Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{ model: Rol, as: 'rol' }]
    });

    if (!usuario) {
      return res.status(401).json({
        message: 'Usuario no encontrado o sesion invalida'
      });
    }

    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Sesion expirada. Por favor inicie sesion nuevamente'
      });
    }

    console.error('Error de autenticacion:', error.message);

    return res.status(403).json({
      message: 'Token de autenticacion invalido'
    });
  }
};

const hasRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Acceso no autorizado: Se requiere inicio de sesion'
      });
    }

    const rolUsuario = normalizarRol(req.user.rol);
    const rolesNormalizados = rolesPermitidos.map(normalizarRol);

    if (!rolesNormalizados.includes(rolUsuario)) {
      return res.status(403).json({
        message: `Acceso denegado. Tu rol actual es '${rolUsuario}'. No tienes permisos suficientes para realizar esta accion`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  hasRole,
  hasAuthority: hasRole,
  requireRole: hasRole
};


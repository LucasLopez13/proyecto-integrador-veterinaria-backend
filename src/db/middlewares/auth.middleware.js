
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const normalizarRol = (rol) => {
  const nombre = typeof rol === 'object' && rol?.nombre
    ? rol.nombre
    : String(rol || '');

  const normalizado = nombre.toLowerCase().trim();
  return normalizado === 'veterinario' ? 'profesional' : normalizado;
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
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
      return res.status(401).json({
        message: 'Usuario no encontrado o sesión inválida'
      });
    }

    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Sesión expirada. Por favor inicie sesión nuevamente'
      });
    }

    console.error('Error de autenticación:', error.message);

    return res.status(403).json({
      message: 'Token de autenticación inválido'
    });
  }
};

const hasRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Acceso no autorizado: Se requiere inicio de sesión'
      });
    }

    const rolUsuario = normalizarRol(req.user.rol);
    const rolesNormalizados = rolesPermitidos.map(normalizarRol);

    if (!rolesNormalizados.includes(rolUsuario)) {
      return res.status(403).json({
        message: `Acceso denegado. Tu rol actual es '${rolUsuario}'`
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


const jwt = require('jsonwebtoken');
const db = require('../models');
const { Usuario } = db;

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Acceso no autorizado: Token no proporcionado'
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

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
    return res.status(403).json({
      message: 'Token de autenticación inválido'
    });
  }
};

const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Acceso no autorizado: Se requiere inicio de sesión'
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        message: `Acceso denegado: Se requiere rol [${rolesPermitidos.join(', ')}]. Tu rol actual es '${req.user.rol}'`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};

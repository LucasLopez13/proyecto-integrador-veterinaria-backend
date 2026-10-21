const jwt = require('jsonwebtoken');
const db = require('../models');
const { Usuario, Rol } = db;

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

    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{ model: Rol, as: 'rol' }]
    });

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

const hasRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Acceso no autorizado: Se requiere inicio de sesión'
      });
    }

    const rolNombre = typeof req.user.rol === 'object' && req.user.rol?.nombre
      ? req.user.rol.nombre
      : String(req.user.rol || '');

    const userRoleNormalizado = rolNombre.toUpperCase().trim();
    const rolesNormalizados = rolesPermitidos.map((r) => String(r).toUpperCase().trim());

    if (!rolesNormalizados.includes(userRoleNormalizado)) {
      return res.status(403).json({
        message: `Acceso denegado: Se requiere uno de los siguientes roles [${rolesPermitidos.join(', ')}]. Tu rol actual es '${rolNombre}'`
      });
    }

    next();
  };
};

const hasAuthority = hasRole;
const requireRole = hasRole;

module.exports = {
  authenticateToken,
  hasRole,
  hasAuthority,
  requireRole
};


const db = require('../models');

const { Usuario } = db;

const usuarioController = {
  getAll: async (req, res, next) => {
    try {
      const usuarios = await Usuario.findAll();
      res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const usuario = await Usuario.findByPk(req.params.id);

      if (!usuario) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }

      res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const usuario = await Usuario.create(req.body);

      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const usuario = await Usuario.findByPk(req.params.id);

      if (!usuario) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }

      await usuario.update(req.body);

      res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const usuario = await Usuario.findByPk(req.params.id);

      if (!usuario) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }

      await usuario.destroy();

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const usuario = await Usuario.findOne({
        where: { email }
      });

      if (!usuario || usuario.password !== password) {
        return res.status(401).json({
          message: 'Email o contraseña incorrectos'
        });
      }

      res.status(200).json({
        id: usuario.id,
        name: `${usuario.nombre} ${usuario.apellido}`,
        email: usuario.email,
        role: usuario.rol === 'veterinario' ? 'profesional' : 'cliente'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = usuarioController;
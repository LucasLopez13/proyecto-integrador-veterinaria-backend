const authService = require('../services/authService');

const authController = {
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  me: async (req, res, next) => {
    try {
      res.status(200).json({ user: req.user.toJSON() });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;

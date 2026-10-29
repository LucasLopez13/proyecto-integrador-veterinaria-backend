const alertaStockService = require('../services/alertaStockService');

const alertaStockController = {
  getAll: async (req, res, next) => {
    try {
      const resultado = await alertaStockService.getAll({
        diasVencimiento: req.query.diasVencimiento ?? 30
      });

      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = alertaStockController;
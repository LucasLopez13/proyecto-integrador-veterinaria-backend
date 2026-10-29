const express = require('express');
const router = express.Router();

const alertaStockController = require('../controllers/alertaStockController');

router.get('/', alertaStockController.getAll);

module.exports = router;
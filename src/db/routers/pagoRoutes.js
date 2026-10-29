const express = require('express');
const router = express.Router();

const pagoController = require('../controllers/pagoController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const schemaValidator = require('../middlewares/schemaValidator');
const { pagoCreateSchema } = require('../schema/pagoSchema');
const Joi = require('joi');

const pagoEstadoSchema = Joi.object({
  estado: Joi.string()
    .valid('pendiente', 'aprobado', 'rechazado')
    .required()
});

router.get('/', authenticateToken, pagoController.getAll);
router.get('/:id', authenticateToken, pagoController.getById);

router.post(
  '/',
  authenticateToken,
  schemaValidator(pagoCreateSchema),
  pagoController.create
);

router.patch(
  '/:id/estado',
  authenticateToken,
  schemaValidator(pagoEstadoSchema),
  pagoController.updateEstado
);

module.exports = router;

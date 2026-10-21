
const express = require('express');
const router = express.Router();
const prescripcionController = require('../controllers/prescripcionController');
const schemaValidator = require('../middlewares/schemaValidator');
const {authenticateToken,hasRole} = require('../middlewares/auth.middleware');
const {prescripcionCreateSchema} = require('../schema/prescripcionSchema');

router.get('/consulta/:consultaId',authenticateToken,prescripcionController.getByConsultaId);
router.post('/consulta/:consultaId',authenticateToken,hasRole('profesional', 'admin'),schemaValidator(prescripcionCreateSchema),prescripcionController.create);
router.post('/:id/confirmar',authenticateToken,hasRole('profesional'),prescripcionController.confirm);

module.exports = router;

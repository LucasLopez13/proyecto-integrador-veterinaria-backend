const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const schemaValidator = require('../middlewares/schemaValidator');
const { authenticateToken, hasRole } = require('../middlewares/auth.middleware');
const { consultaCreateSchema } = require('../schema/consultaSchema');

router.post('/', authenticateToken, hasRole('profesional', 'admin'), schemaValidator(consultaCreateSchema), consultaController.create);
router.get('/', authenticateToken, hasRole('profesional', 'admin'), consultaController.getAll);
router.get('/mascota/:mascotaId', authenticateToken, consultaController.getByMascotaId);
router.get('/:id', authenticateToken, consultaController.getById);

module.exports = router;

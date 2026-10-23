const express = require('express');
const router = express.Router();
const registroSanitarioController = require('../controllers/registroSanitarioController');
const schemaValidator = require('../middlewares/schemaValidator');
const { authenticateToken, hasRole } = require('../middlewares/auth.middleware');
const {registroSanitarioCreateSchema,registroSanitarioUpdateSchema} = require('../schema/registroSanitarioSchema');

router.get('/',authenticateToken,registroSanitarioController.getAll);
router.get('/mascota/:mascotaId',authenticateToken,registroSanitarioController.getByMascota);
router.get('/:id',authenticateToken,registroSanitarioController.getById);
router.post('/',authenticateToken,hasRole('profesional', 'admin'),schemaValidator(registroSanitarioCreateSchema), registroSanitarioController.create);
router.put('/:id',authenticateToken,hasRole('profesional', 'admin'),schemaValidator(registroSanitarioUpdateSchema),registroSanitarioController.update);
router.delete('/:id',authenticateToken,hasRole('profesional', 'admin'),registroSanitarioController.delete);

module.exports = router;
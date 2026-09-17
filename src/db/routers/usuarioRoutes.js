const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const schemaValidator = require('../middlewares/schemaValidator');
const { usuarioCreateSchema, usuarioUpdateSchema } = require('../schema/usuarioSchema');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, usuarioController.getAll);
router.get('/:id', authenticateToken, usuarioController.getById);
router.post('/', schemaValidator(usuarioCreateSchema), usuarioController.create);
router.put('/:id', authenticateToken, schemaValidator(usuarioUpdateSchema), usuarioController.update);
router.delete('/:id', authenticateToken, usuarioController.delete);

module.exports = router;

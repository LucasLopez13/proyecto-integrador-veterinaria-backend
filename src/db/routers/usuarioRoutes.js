const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const schemaValidator = require('../middlewares/schemaValidator');
const { usuarioCreateSchema, usuarioUpdateSchema } = require('../schema/usuarioSchema');

router.get('/', usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.post('/', schemaValidator(usuarioCreateSchema), usuarioController.create);
router.put('/:id', schemaValidator(usuarioUpdateSchema), usuarioController.update);
router.delete('/:id', usuarioController.delete);

module.exports = router;

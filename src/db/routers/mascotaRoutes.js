const express = require('express');
const router = express.Router();
const mascotaController = require('../controllers/mascotaController');
const schemaValidator = require('../middlewares/schemaValidator');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { mascotaCreateSchema, mascotaUpdateSchema } = require('../schema/mascotaSchema');

router.get('/', authenticateToken,mascotaController.getAll);
router.get('/:id',authenticateToken, mascotaController.getById);
router.post('/', authenticateToken,schemaValidator(mascotaCreateSchema), mascotaController.create);
router.put('/:id', authenticateToken,schemaValidator(mascotaUpdateSchema), mascotaController.update);
router.delete('/:id',authenticateToken, mascotaController.delete);

module.exports = router;

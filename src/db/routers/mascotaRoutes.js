const express = require('express');
const router = express.Router();
const mascotaController = require('../controllers/mascotaController');
const schemaValidator = require('../middlewares/schemaValidator');
const { mascotaCreateSchema, mascotaUpdateSchema } = require('../schema/mascotaSchema');
const consultaController = require('../controllers/consultaController');

router.get('/', mascotaController.getAll);
router.get('/:id/consultas', consultaController.getByMascota);
router.get('/:id', mascotaController.getById);
router.post('/', schemaValidator(mascotaCreateSchema), mascotaController.create);
router.put('/:id', schemaValidator(mascotaUpdateSchema), mascotaController.update);
router.delete('/:id', mascotaController.delete);

module.exports = router;

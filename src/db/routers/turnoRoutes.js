const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const schemaValidator = require('../middlewares/schemaValidator');
const { turnoCreateSchema, turnoUpdateSchema } = require('../schema/turnoSchema');

router.get('/', turnoController.getAll);
router.get('/:id', turnoController.getById);
router.post('/', schemaValidator(turnoCreateSchema), turnoController.create);
router.put('/:id', schemaValidator(turnoUpdateSchema), turnoController.update);
router.delete('/:id', turnoController.delete);

module.exports = router;

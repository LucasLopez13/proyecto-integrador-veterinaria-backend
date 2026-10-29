const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const schemaValidator = require('../middlewares/schemaValidator');
const { authenticateToken } = require('../middlewares/auth.middleware');
const {
    turnoCreateSchema,
    turnoUpdateSchema,
    turnoEstadoSchema
} = require('../schema/turnoSchema');

router.get('/', authenticateToken, turnoController.getAll);
router.get('/:id', authenticateToken, turnoController.getById);
router.post('/', authenticateToken, schemaValidator(turnoCreateSchema), turnoController.create);
router.put('/:id', authenticateToken, schemaValidator(turnoUpdateSchema), turnoController.update);
router.delete('/:id', authenticateToken, turnoController.delete);
router.patch(
    '/:id/estado',
    authenticateToken,
    schemaValidator(turnoEstadoSchema),
    turnoController.cambiarEstado
);

module.exports = router;

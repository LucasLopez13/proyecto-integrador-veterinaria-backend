const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const schemaValidator = require('../middlewares/schemaValidator');
const { authRegisterSchema, authLoginSchema } = require('../schema/usuarioSchema');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.post('/register', schemaValidator(authRegisterSchema), authController.register);
router.post('/login', schemaValidator(authLoginSchema), authController.login);

router.get('/me', authenticateToken, authController.me);

module.exports = router;

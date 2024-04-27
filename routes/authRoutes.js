const express = require('express');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();
router.post('/register', authController.register);
router.post('/login', authController.login);
// router.get('/verify', authController.verify);
// router.get('/me', verifyToken, authController.getMe);
// router.get('/', verifyToken, authController.getUsers);
// router.get('/:id', verifyToken, authController.getUserById);
// router.put('/:id', authController.updateUser);
// router.post('/change-password-request', authController.forgotPasswordSend);
// router.post('/change-password', authController.changePassword);

module.exports = router;

const express = require('express');
const electricController = require('../controllers/electricController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();
router.get('/active', verifyToken,  electricController.getActive);
router.post('/', verifyToken,  electricController.store);
router.get('/', verifyToken,  electricController.index);
router.get('/:id', verifyToken,  electricController.show);
router.put('/:id', verifyToken,  electricController.update);
router.delete('/:id', verifyToken,  electricController.destroy);
router.post('/activate/:id', verifyToken,  electricController.setAsActive);


module.exports = router;

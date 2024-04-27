const express = require('express');
const humanController = require('../controllers/humanController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();
router.post('/',
verifyToken,humanController.store);
router.get('/',
verifyToken,humanController.index);
router.get('/:id',
 verifyToken,
 humanController.show);
router.put('/:id',
verifyToken, humanController.update);
router.delete('/:id', 
verifyToken, humanController.destroy);


module.exports = router;

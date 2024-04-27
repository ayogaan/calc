const express = require('express');
const woodController = require('../controllers/woodController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();
router.get('/active',verifyToken, woodController.getActive);
router.post('/', verifyToken, woodController.store);
router.get('/',verifyToken, woodController.index);
router.get('/:id', verifyToken, woodController.show);
router.put('/:id', verifyToken, woodController.update);
router.delete('/:id', verifyToken, woodController.destroy);
router.post('/set/:id', verifyToken, woodController.set);


module.exports = router;

const express = require('express');
const resultController = require('../controllers/resultController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();
router.post('/', verifyToken, resultController.store);
router.get('/',verifyToken, resultController.index);
router.get('/download/:id', resultController.downloadResult);
router.get('/:id',verifyToken, resultController.show);
router.delete('/:id',verifyToken, resultController.destroy);


module.exports = router;

const express = require('express');
const router = express.Router();
const configuracionVigenciaController = require('../controllers/configuracionVigenciaController');

router.get('/dias-vigencia', configuracionVigenciaController.obtenerDiasVigencia);
router.post('/dias-vigencia', configuracionVigenciaController.actualizarDiasVigencia);

module.exports = router; 
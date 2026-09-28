const express = require('express');
const router = express.Router();
const configuracionCondicionesController = require('../controllers/configuracionCondicionesController');

// GET público (lo lee la calculadora); POST protegido (lo guarda el admin, con token).
router.get('/', configuracionCondicionesController.obtenerCondiciones);
router.post('/', configuracionCondicionesController.actualizarCondiciones);

module.exports = router;

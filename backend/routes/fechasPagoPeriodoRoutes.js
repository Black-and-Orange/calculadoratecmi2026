const express = require('express');
const router = express.Router();
const fechasPagoController = require('../controllers/fechasPagoPeriodoController');

// Fechas de un período (admin y calculadora)
router.get('/periodo/:periodoId', fechasPagoController.getFechasByPeriodo);

// Fechas de todos los períodos de un nivel (calculadora pública)
router.get('/nivel/:nivelId', fechasPagoController.getFechasByNivel);

// Reemplazar la lista de fechas de un período (requiere token: el middleware
// global de index.js protege toda escritura no listada como pública)
router.put('/periodo/:periodoId', fechasPagoController.replaceFechasForPeriodo);

module.exports = router;

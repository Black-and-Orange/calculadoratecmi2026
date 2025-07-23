const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');

// Crear una nueva cotización
router.post('/', cotizacionesController.createCotizacion);

// Obtener todas las cotizaciones
router.get('/', cotizacionesController.getAllCotizaciones);

// Obtener cotizaciones por rango de fechas
router.get('/por-fecha', cotizacionesController.getCotizacionesByDateRange);

// Obtener cotizaciones por nivel
router.get('/por-nivel/:nivelId', cotizacionesController.getCotizacionesByNivel);

// Obtener estadísticas de cotizaciones
router.get('/estadisticas', cotizacionesController.getCotizacionesStats);

// Obtener cotización por id
router.get('/:id', cotizacionesController.getCotizacionById);

// Eliminar cotización
router.delete('/:id', cotizacionesController.deleteCotizacion);

module.exports = router; 
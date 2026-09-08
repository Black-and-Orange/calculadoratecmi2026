const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');
// Los GET de listado exponen datos personales → exigen token (Fase 2, Bloque 0).
// El middleware global de index.js deja pasar los GET; este gate por-ruta los protege.
const authenticateToken = require('../middlewares/authenticateToken');
const rateLimit = require('../middlewares/rateLimit');
const validarIdNumerico = require('../middlewares/validarIdNumerico');

// :id debe ser numérico (Block 1 / P4)
router.param('id', validarIdNumerico);

// Límite por IP para la creación pública de cotizaciones (Block 1 / P2)
const limitCrear = rateLimit({ bucket: 'cotizaciones', windowMs: 60 * 1000, max: 10 });

// Crear una nueva cotización
router.post('/', limitCrear, cotizacionesController.createCotizacion);

// Obtener todas las cotizaciones (datos personales → requiere token)
router.get('/', authenticateToken, cotizacionesController.getAllCotizaciones);

// Obtener cotizaciones por rango de fechas (requiere token)
router.get('/por-fecha', authenticateToken, cotizacionesController.getCotizacionesByDateRange);

// Obtener cotizaciones por nivel (requiere token)
router.get('/por-nivel/:nivelId', authenticateToken, cotizacionesController.getCotizacionesByNivel);

// Obtener estadísticas de cotizaciones (requiere token)
router.get('/estadisticas', authenticateToken, cotizacionesController.getCotizacionesStats);

// Obtener cotización por id — PÚBLICO a propósito: habilita el enlace de
// cotización compartida (WhatsApp). (Decisión de negocio, Fase 2.)
router.get('/:id', cotizacionesController.getCotizacionById);

// Eliminar cotización
router.delete('/:id', cotizacionesController.deleteCotizacion);

module.exports = router; 
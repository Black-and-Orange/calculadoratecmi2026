const express = require('express');
const router = express.Router();
const periodicidadController = require('../controllers/periodicidadController');

// Obtener todos los campus
router.get('/', periodicidadController.getAllPeriodicidad);

// Obtener un campus por ID
router.get('/:id', periodicidadController.getPeriodicidadById);

// Crear un nuevo campus con su nivel
router.post('/', periodicidadController.createPeriodicidadWithNivel);

// Actualizar un campus y su nivel
router.put('/:id', periodicidadController.updatePeriodicidadWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', periodicidadController.deletePeriodicidadWithNivel);

module.exports = router;

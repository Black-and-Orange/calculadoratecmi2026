const express = require('express');
const router = express.Router();
const periodoController = require('../controllers/periodoController');

// Obtener todos los campus
router.get('/', periodoController.getAllPeriodo);

router.get('/nivel/:nivelId', periodoController.getPeriodosByNivel);

// Obtener un campus por ID
router.get('/:id', periodoController.getPeriodoById);

// Crear un nuevo campus con su nivel
router.post('/', periodoController.createPeriodoWithNivel);

// Actualizar un campus y su nivel
router.patch('/:id', periodoController.updatePeriodoWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', periodoController.deletePeriodoWithNivel);

module.exports = router;

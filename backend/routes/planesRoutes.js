const express = require('express');
const router = express.Router();
const planesController = require('../controllers/planesController');

// Obtener todos los campus
router.get('/', planesController.getAllPlanes);

router.get('/nivel/:nivelId', planesController.getPlanesByNivel);

// Obtener un campus por ID
router.get('/:id', planesController.getPlanById);

// Crear un nuevo campus con su nivel
router.post('/', planesController.createPlanWithNivel);

// Actualizar un campus y su nivel
router.put('/:id', planesController.updatePlanWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', planesController.deletePlanWithNivel);

module.exports = router;

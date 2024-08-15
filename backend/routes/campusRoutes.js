const express = require('express');
const router = express.Router();
const campusController = require('../controllers/campusController');

// Obtener todos los campus
router.get('/', campusController.getAllCampus);

// Obtener todos los campus de un nivel
router.get('/nivel/:nivelId', campusController.getCampusesByNivel);

// Obtener un campus por ID
router.get('/:id', campusController.getCampusById);

// Crear un nuevo campus con su nivel
router.post('/', campusController.createCampusWithNivel);

// Actualizar un campus y su nivel
router.patch('/:id', campusController.updateCampusWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', campusController.deleteCampusWithNivel);

module.exports = router;

const express = require('express');
const router = express.Router();
const nivelController = require('../controllers/nivelController');

// Obtener todos los campus
router.get('/', nivelController.getNiveles);

// Obtener un campus por ID
router.get('/:id', nivelController.getNivelById);

// Crear un nuevo campus con su nivel
router.post('/', nivelController.createNivel);

// Actualizar un campus y su nivel
router.put('/:id', nivelController.updateNivel);

// Eliminar un campus y su nivel
router.delete('/:id', nivelController.deleteNivel);

module.exports = router;

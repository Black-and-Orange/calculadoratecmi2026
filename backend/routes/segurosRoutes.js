const express = require('express');
const router = express.Router();
const segurosController = require('../controllers/segurosController');

// Obtener todos los campus
router.get('/', segurosController.getAllSeguros);

// Obtener un campus por ID
router.get('/:id', segurosController.getSeguroById);

// Crear un nuevo campus con su nivel
router.post('/', segurosController.createSeguroWithNivel);

// Actualizar un campus y su nivel
router.put('/:id', segurosController.updateSeguroWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', segurosController.deleteSeguroWithNivel);

module.exports = router;

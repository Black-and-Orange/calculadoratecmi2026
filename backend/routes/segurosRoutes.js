const express = require('express');
const router = express.Router();
const segurosController = require('../controllers/segurosController');

// Obtener todos los campus
router.get('/', segurosController.getAllSeguro);

router.get('/nivel/:nivelId', segurosController.getSegurosByNivel);

// Obtener un campus por ID
router.get('/:id', segurosController.getSeguroById);

// Crear un nuevo campus con su nivel
router.post('/', segurosController.createSeguroWithNivel);

// Actualizar un campus y su nivel
router.patch('/:id', segurosController.updateSeguroWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', segurosController.deleteSeguroWithNivel);

module.exports = router;

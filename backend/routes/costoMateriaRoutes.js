const express = require('express');
const router = express.Router();
const costoController = require('../controllers/costoMateriaController');

// Obtener todos los campus
router.get('/', costoController.getAllCosto);

router.get('/nivel/:nivelId', costoController.getCostosByNivel);

// Obtener un campus por ID
router.get('/:id', costoController.getCostoById);

// Crear un nuevo campus con su nivel
router.post('/', costoController.createCostoWithNivel);

// Actualizar un campus y su nivel
router.patch('/:id', costoController.updateCostoWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', costoController.deleteCostoWithNivel);

module.exports = router;

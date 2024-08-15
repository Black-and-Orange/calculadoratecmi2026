const express = require('express');
const router = express.Router();
const costoController = require('../controllers/costoMateriaController');

// Obtener todos los campus
router.get('/', costoController.getAllCostoMateria);

router.get('/nivel/:nivelId', costoController.getCostosByNivel);

// Obtener un campus por ID
router.get('/:id', costoController.getCostoMateriaById);

// Crear un nuevo campus con su nivel
router.post('/', costoController.createCostoMateriaWithNivel);

// Actualizar un campus y su nivel
router.put('/:id', costoController.updateCostoMateriaWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', costoController.deleteCostoMateriaWithNivel);

module.exports = router;

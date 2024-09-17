const express = require('express');
const router = express.Router();
const materiasController = require('../controllers/materiasController');

// Obtener todos los campus
router.get('/', materiasController.getAllMaterias);

router.get('/nivel/:nivelId', materiasController.getMateriasByNivel);

// Obtener un campus por ID
router.get('/:id', materiasController.getMateriaById);

// Crear un nuevo campus con su nivel
router.post('/', materiasController.createMateriaWithNivel);

// Actualizar un campus y su nivel
router.patch('/:id', materiasController.updateMateriaWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', materiasController.deleteMateriaWithNivel);

module.exports = router;

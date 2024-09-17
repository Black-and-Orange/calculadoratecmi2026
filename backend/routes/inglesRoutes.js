const express = require('express');
const router = express.Router();
const inglesController = require('../controllers/inglesController');

// Obtener todos los campus
router.get('/', inglesController.getAllIngles);

router.get('/nivel/:nivelId', inglesController.getInglesByNivel);

// Obtener un campus por ID
router.get('/:id', inglesController.getInglesById);

// Crear un nuevo campus con su nivel
router.post('/', inglesController.createInglesWithNivel);

// Actualizar un campus y su nivel
router.patch('/:id', inglesController.updateInglesWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', inglesController.deleteInglesWithNivel);

module.exports = router;

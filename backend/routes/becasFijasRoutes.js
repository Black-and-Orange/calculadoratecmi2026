const express = require('express');
const router = express.Router();
const becasFijasController = require('../controllers/becasFijasController');

// Obtener todos los becasFijas
router.get('/', becasFijasController.getBecasFijas);

// Obtener todos los becasFijas de un nivel
router.get('/nivel/:nivelId', becasFijasController.getBecasFijasByNivel);

// Obtener todos los becasFijas de un nivel y promedio
router.get('/nivel/:nivelId/promedio', becasFijasController.getBecasFijasByAverage);

// Obtener un becasFijas por ID
router.get('/:id', becasFijasController.getBecaFijaById);

// Crear un nuevo becasFijas con su nivel
router.post('/', becasFijasController.createBecaFijaWithNivel);

// Actualizar un becasFijas y su nivel
router.patch('/:id', becasFijasController.updateBecaFijaWithNivel);

// Eliminar un becasFijas y su nivel
router.delete('/:id', becasFijasController.deleteBecaFijaWithNivel);

module.exports = router;

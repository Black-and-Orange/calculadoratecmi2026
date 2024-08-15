const express = require('express');
const router = express.Router();
const interesesController = require('../controllers/interesesController');

// Obtener todos los intereses
router.get('/', interesesController.getIntereses);

// Obtener todos los intereses de un nivel
router.get('/nivel/:nivelId', interesesController.getInteresesByNivel);

// Obtener un intereses por ID
router.get('/:id', interesesController.getInteresById);

// Crear un nuevo intereses con su nivel
router.post('/', interesesController.createInteresWithNivel);

// Actualizar un intereses y su nivel
router.patch('/:id', interesesController.updateInteresWithNivel);

// Eliminar un intereses y su nivel
router.delete('/:id', interesesController.deleteInteresWithNivel);

module.exports = router;

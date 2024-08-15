const express = require('express');
const router = express.Router();
const formatoController = require('../controllers/formatoController');

// Obtener todos los campus
router.get('/', formatoController.getAllFormatos);

router.get('/nivel/:nivelId', formatoController.getFormatosByNivel);

// Obtener un campus por ID
router.get('/:id', formatoController.getFormatoById);

// Crear un nuevo campus con su nivel
router.post('/', formatoController.createFormatoWithNivel);

// Actualizar un campus y su nivel
router.put('/:id', formatoController.updateFormatoWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', formatoController.deleteFormartoWithNivel);

module.exports = router;

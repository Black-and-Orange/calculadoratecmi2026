const express = require('express');
const router = express.Router();
const textosController = require('../controllers/textosController');

// Obtener todos los textos
router.get('/', textosController.getBecasVariables);

// Obtener todos los textos de un nivel
router.get('/nivel/:nivelId', textosController.getBecasVariablesByNivel);

// Obtener un textos por ID
router.get('/:id', textosController.getTextoById);

// Crear un nuevo textos con su nivel
router.post('/', textosController.createTextoWithNivel);

// Actualizar un textos y su nivel
router.patch('/:id', textosController.updateTextoWithNivel);

// Eliminar un textos y su nivel
router.delete('/:id', textosController.deleteTextoWithNivel);

module.exports = router;

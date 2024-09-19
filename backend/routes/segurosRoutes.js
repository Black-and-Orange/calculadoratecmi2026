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

// Eliminar un campus y su nivel
router.delete('/:id', segurosController.deleteSeguroWithNivel);

// Actualizar nombre de los seguros
router.patch('/cambiar-nombres', segurosController.changeColumnNames);

// Actualizar un campus y su nivel
router.patch('/:id', segurosController.updateSeguroWithNivel);

module.exports = router;

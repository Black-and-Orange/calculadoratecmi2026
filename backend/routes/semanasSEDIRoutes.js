const express = require('express');
const router = express.Router();
const semanasController = require('../controllers/semanasSEDIController');

// Obtener todos los campus
router.get('/', semanasController.getAllSemanas);

router.get('/nivel/:nivelId', semanasController.getSemanasByNivel);

// Obtener un campus por ID
router.get('/:id', semanasController.getSemanasById);

// Crear un nuevo campus con su nivel
router.post('/', semanasController.createSemanasWithNivel);

// Actualizar un campus y su nivel
router.patch('/:id', semanasController.updateSemanasWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', semanasController.deleteSemanasWithNivel);

module.exports = router;

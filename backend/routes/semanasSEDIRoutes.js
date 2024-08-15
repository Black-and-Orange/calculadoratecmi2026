const express = require('express');
const router = express.Router();
const semanasController = require('../controllers/semanasSEDIController');

// Obtener todos los semanas
router.get('/', semanasController.getAllSemanas);

// Obtener todos los semanas de un nivel
router.get('/nivel/:nivelId', semanasController.getSemanasByNivel);

// Crear un nuevo semanas con su nivel
router.post('/', semanasController.resetAndAddSemanas);

module.exports = router;

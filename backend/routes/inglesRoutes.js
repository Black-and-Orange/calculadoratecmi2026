const express = require('express');
const router = express.Router();
const inglesController = require('../controllers/inglesController');

// Obtener todos los ingles
router.get('/', inglesController.getAllIngles);

// Obtener todos los ingles de un nivel
router.get('/nivel/:nivelId', inglesController.getInglesByNivel);

// Crear un nuevo ingles con su nivel
router.post('/', inglesController.resetAndAddIngles);

module.exports = router;

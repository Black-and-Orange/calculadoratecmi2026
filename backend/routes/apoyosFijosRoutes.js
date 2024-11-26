const express = require('express');
const router = express.Router();
const apoyosController = require('../controllers/apoyosfijosController');

// Obtener todos los apoyos
router.get('/', apoyosController.getApoyos);

// Obtener todos los apoyos de un nivel
router.get('/nivel/:nivelId', apoyosController.getApoyosByNivel);

// Obtener un apoyos por ID
router.get('/:id', apoyosController.getApoyoById);

// Crear un nuevo apoyos con su nivel
router.post('/', apoyosController.createApoyoWithNivel);

// Actualizar un apoyos y su nivel
router.patch('/:id', apoyosController.updateApoyoWithNivel);

// Eliminar un apoyos y su nivel
router.delete('/:id', apoyosController.deleteApoyoWithNivel);

module.exports = router;

const express = require('express');
const router = express.Router();
const beneficiosController = require('../controllers/beneficiosController');

// Obtener todos los beneficios
router.get('/', beneficiosController.getBeneficios);

// Obtener todos los beneficios de un nivel
router.get('/nivel/:nivelId', beneficiosController.getBeneficiosByNivel);

// Obtener un beneficios por ID
router.get('/:id', beneficiosController.getBeneficioById);

// Crear un nuevo beneficios con su nivel
router.post('/', beneficiosController.createBeneficioWithNivel);

// Actualizar un beneficios y su nivel
router.patch('/:id', beneficiosController.updateBeneficioWithNivel);

// Eliminar un beneficios y su nivel
router.delete('/:id', beneficiosController.deleteBeneficioWithNivel);

module.exports = router;

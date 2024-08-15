const express = require('express');
const router = express.Router();
const creditosController = require('../controllers/creditosController');

// Obtener todos los creditos
router.get('/', creditosController.getCreditos);

// Obtener todos los creditos de un nivel
router.get('/nivel/:nivelId', creditosController.getCreditosByNivel);

// Obtener un creditos por ID
router.get('/:id', creditosController.getCreditoById);

// Crear un nuevo creditos con su nivel
router.post('/', creditosController.createCreditoWithNivel);

// Actualizar un creditos y su nivel
router.patch('/:id', creditosController.updateCreditoWithNivel);

// Eliminar un creditos y su nivel
router.delete('/:id', creditosController.deleteCreditoWithNivel);

module.exports = router;

const express = require('express');
const router = express.Router();
const becasVariablesController = require('../controllers/becasVariablesController');

// Obtener todos los becasVariables
router.get('/', becasVariablesController.getBecasVariables);

// Obtener todos los becasVariables de un nivel
router.get('/nivel/:nivelId', becasVariablesController.getBecasVariablesByNivel);

// Obtener todos los becasVariables de un nivel y promedio
router.get('/nivel/:nivelId/promedio', becasVariablesController.getBecasVariablesByAverage);

// Obtener los rangos de porcentaje de una beca variable
router.get('/rangosPorcentaje/:id', becasVariablesController.getRangosPorcentajeByBecaId);

// Obtener un becasVariables por ID
router.get('/:id', becasVariablesController.getBecaVariableById);

// Crear un nuevo becasVariables con su nivel
router.post('/', becasVariablesController.createBecaVariableWithNivel);

// Actualizar un becasVariables y su nivel
router.patch('/:id', becasVariablesController.updateBecaVariableWithNivel);

// Eliminar un becasVariables y su nivel
router.delete('/:id', becasVariablesController.deleteBecaVariableWithNivel);

module.exports = router;

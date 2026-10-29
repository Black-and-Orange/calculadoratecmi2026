const express = require('express');
const router = express.Router();
const segurosController = require('../controllers/segurosController');
const validarIdNumerico = require('../middlewares/validarIdNumerico');

// :id debe ser numérico (Block 1 / P4): cierra el paso a ids no numéricos
// (p. ej. la antigua ruta "cambiar-nombres" que caería en "/:id").
router.param('id', validarIdNumerico);

// Obtener todos los campus
router.get('/', segurosController.getAllSeguro);

// IMPORTANTE: La ruta más específica debe ir ANTES de la genérica
router.get('/nivel/:nivelId/todos', segurosController.getSegurosByNivelAll);
// Excepciones de precio por campus de un nivel (admin)
router.get('/nivel/:nivelId/precios-campus', segurosController.getPreciosCampusByNivel);
router.get('/nivel/:nivelId', segurosController.getSegurosByNivel);

// Alta/edición y borrado de excepciones de precio por campus.
// (DELETE /precios-campus debe ir ANTES de DELETE /:id para no chocar con el
//  validador numérico de :id.)
router.post('/precios-campus', segurosController.upsertPreciosCampus);
router.delete('/precios-campus', segurosController.deletePrecioCampus);

// Obtener un campus por ID
router.get('/:id', segurosController.getSeguroById);

// Crear un nuevo campus con su nivel
router.post('/', segurosController.createSeguroWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', segurosController.deleteSeguroWithNivel);


// Actualizar un campus y su nivel
router.patch('/:id', segurosController.updateSeguroWithNivel);

module.exports = router;

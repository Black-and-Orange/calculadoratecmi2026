const express = require('express');
const router = express.Router();
const certificadosController = require('../controllers/certificadosController');

// Obtener todos los campus
router.get('/', certificadosController.getAllCertificados);

router.get('/nivel/:nivelId', certificadosController.getCertificadosByNivel);

// Obtener un campus por ID
router.get('/:id', certificadosController.getCertificadoById);

// Crear un nuevo campus con su nivel
router.post('/', certificadosController.createCertificadoWithNivel);

// Actualizar un campus y su nivel
router.patch('/:id', certificadosController.updateCertificadoWithNivel);

// Eliminar un campus y su nivel
router.delete('/:id', certificadosController.deleteCertificadoWithNivel);

module.exports = router;

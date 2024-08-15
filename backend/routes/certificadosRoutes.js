const express = require('express');
const router = express.Router();
const certificadosController = require('../controllers/certificadosController');

// Obtener todos los certificados
router.get('/', certificadosController.getAllCertificados);

// Obtener todos los certificados de un nivel
router.get('/nivel/:nivelId', certificadosController.getCertificadosByNivel);

// Crear un nuevo certificados con su nivel
router.post('/', certificadosController.resetAndAddCertificados);

module.exports = router;

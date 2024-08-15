const express = require('express');
const router = express.Router();
const prestamosController = require('../controllers/prestamosController');

// Obtener todos los prestamos
router.get('/', prestamosController.getPrestamos);

// Obtener todos los prestamos de un nivel
router.get('/nivel/:nivelId', prestamosController.getPrestamosByNivel);

// Obtener un prestamos por ID
router.get('/:id', prestamosController.getPrestamoById);

// Crear un nuevo prestamos con su nivel
router.post('/', prestamosController.createPrestamoWithNivel);

// Actualizar un prestamos y su nivel
router.patch('/:id', prestamosController.updatePrestamoWithNivel);

// Eliminar un prestamos y su nivel
router.delete('/:id', prestamosController.deletePrestamoWithNivel);

module.exports = router;

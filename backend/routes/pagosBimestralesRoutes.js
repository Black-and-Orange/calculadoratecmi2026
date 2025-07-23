const express = require('express');
const router = express.Router();
const pagosBimestralesController = require('../controllers/pagosBimestralesController');

router.get('/', pagosBimestralesController.getAllPagosBimestrales);
router.get('/:id', pagosBimestralesController.getPagoBimestralById);
router.get('/nivel/:nivel_id', pagosBimestralesController.getPagosBimestralesByNivel);
router.post('/', pagosBimestralesController.createPagoBimestral);
router.put('/:id', pagosBimestralesController.updatePagoBimestral);
router.delete('/:id', pagosBimestralesController.deletePagoBimestral);

module.exports = router; 
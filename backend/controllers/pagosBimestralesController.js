const pagosBimestralesModel = require('../models/pagosBimestrales');

// Obtener todos los pagos bimestrales
const getAllPagosBimestrales = (req, res) => {
    pagosBimestralesModel.getAllPagosBimestrales((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Obtener un pago bimestral por ID
const getPagoBimestralById = (req, res) => {
    const id = req.params.id;
    pagosBimestralesModel.getPagoBimestralById(id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result.length) return res.status(404).json({ error: 'No encontrado' });
        res.json(result[0]);
    });
};

// Obtener pagos bimestrales por nivel
const getPagosBimestralesByNivel = (req, res) => {
    const nivel_id = req.params.nivel_id;
    pagosBimestralesModel.getPagosBimestralesByNivel(nivel_id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Crear un nuevo pago bimestral
const createPagoBimestral = (req, res) => {
    const pago = req.body;
    pagosBimestralesModel.createPagoBimestral(pago, (err, result) => {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id: result.insertId, ...pago });
    });
};

// Actualizar un pago bimestral
const updatePagoBimestral = (req, res) => {
    const id = req.params.id;
    const pago = req.body;
    pagosBimestralesModel.updatePagoBimestral(id, pago, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id, ...pago });
    });
};

// Eliminar un pago bimestral
const deletePagoBimestral = (req, res) => {
    const id = req.params.id;
    pagosBimestralesModel.deletePagoBimestral(id, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Eliminado correctamente' });
    });
};

module.exports = {
    getAllPagosBimestrales,
    getPagoBimestralById,
    getPagosBimestralesByNivel,
    createPagoBimestral,
    updatePagoBimestral,
    deletePagoBimestral
}; 
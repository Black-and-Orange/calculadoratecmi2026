const segurosModel = require('../models/seguros');
const segurosNivelModel = require('../models/segurosNivel');

const getAllSeguros = (req, res) => {
    segurosModel.getAllSeguros((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const getSeguroById = (req, res) => {
    const id = req.params.id;
    segurosModel.getSeguroById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Seguro no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createSeguroWithNivel = (req, res) => {
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Crea el Seguro
    segurosModel.createSeguro({ nombre, categoria_coleg }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const seguro_id = result.insertId;

        // Crea la relación con nivel
        segurosNivelModel.createSegurosNivel({ seguro_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ seguro_id });
        });
    });
};

const updateSeguroWithNivel = (req, res) => {
    const seguro_id = req.params.id;
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Actualiza el Seguro
    segurosModel.updateSeguro(seguro_id, { nombre, categoria_coleg }, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Actualiza la relación con nivel
        segurosNivelModel.updateSegurosNivel(seguro_id, { nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Seguro y relación actualizados' });
        });
    });
};

const deleteSeguroWithNivel = (req, res) => {
    const seguro_id = req.params.id;

    // Elimina la relación con nivel
    segurosNivelModel.deleteSegurosNivel(seguro_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el Seguro
        segurosModel.deleteSeguro(seguro_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Seguro y relación eliminados' });
        });
    });
};

module.exports = {
    getAllSeguros,
    getSeguroById,
    createSeguroWithNivel,
    updateSeguroWithNivel,
    deleteSeguroWithNivel
};

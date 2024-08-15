const formatoModel = require('../models/formato');
const formatoNivelModel = require('../models/formatoNivel');

const getAllFormatos = (req, res) => {
    formatoModel.getAllFormatos((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const getFormatosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    formatoModel.getFormatosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

const getFormatoById = (req, res) => {
    const id = req.params.id;
    formatoModel.getFormatoById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Formato no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createFormatoWithNivel = (req, res) => {
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Crea el Formato
    formatoModel.createFormato({ nombre, categoria_coleg }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const formato_id = result.insertId;

        // Crea la relación con nivel
        formatoNivelModel.createFormatoNivel({ formato_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ formato_id });
        });
    });
};

const updateFormatoWithNivel = (req, res) => {
    const formato_id = req.params.id;
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Actualiza el Formato
    formatoModel.updateFormato(formato_id, { nombre, categoria_coleg }, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Actualiza la relación con nivel
        formatoNivelModel.updateFormatoNivel(formato_id, { nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Formato y relación actualizados' });
        });
    });
};

const deleteFormartoWithNivel = (req, res) => {
    const formato_id = req.params.id;

    // Elimina la relación con nivel
    formatoNivelModel.deleteFormatoNivel(formato_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el Formato
        formatoModel.deleteFormato(formato_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Formato y relación eliminados' });
        });
    });
};

module.exports = {
    getAllFormatos,
    getFormatoById,
    getFormatosByNivel,
    createFormatoWithNivel,
    updateFormatoWithNivel,
    deleteFormartoWithNivel
};

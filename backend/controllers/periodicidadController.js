const periodicidadModel = require('../models/periodicidad');
const periodicidadNivelModel = require('../models/periodicidadNivel');

const getAllPeriodicidad = (req, res) => {
    periodicidadModel.getAllPeriodicidades((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const getPeriodicidadById = (req, res) => {
    const id = req.params.id;
    periodicidadModel.getPeriodicidadById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Periodicidad no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createPeriodicidadWithNivel = (req, res) => {
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Crea el Periodicidad
    periodicidadModel.createPeriodicidad({ nombre, categoria_coleg }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const periodicidad_id = result.insertId;

        // Crea la relación con nivel
        periodicidadNivelModel.createPeriodicidadNivel({ periodicidad_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ periodicidad_id });
        });
    });
};

const updatePeriodicidadWithNivel = (req, res) => {
    const periodicidad_id = req.params.id;
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Actualiza el Periodicidad
    periodicidadModel.updatePeriodicidad(periodicidad_id, { nombre, categoria_coleg }, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Actualiza la relación con nivel
        periodicidadNivelModel.updatePeriodicidadNivel(periodicidad_id, { nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Periodicidad y relación actualizados' });
        });
    });
};

const deletePeriodicidadWithNivel = (req, res) => {
    const periodicidad_id = req.params.id;

    // Elimina la relación con nivel
    periodicidadNivelModel.deletePeriodicidadNivel(periodicidad_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el Periodicidad
        periodicidadModel.deletePeriodicidad(periodicidad_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Periodicidad y relación eliminados' });
        });
    });
};

module.exports = {
    getAllPeriodicidad,
    getPeriodicidadById,
    createPeriodicidadWithNivel,
    updatePeriodicidadWithNivel,
    deletePeriodicidadWithNivel
};

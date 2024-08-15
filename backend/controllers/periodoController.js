const periodoModel = require('../models/periodo');
const periodoNivelModel = require('../models/periodoNivel');

const getAllPeriodo = (req, res) => {
    periodoModel.getAllPeriodos((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const getPeriodosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    periodoModel.getPeriodosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};


const getPeriodoById = (req, res) => {
    const id = req.params.id;
    periodoModel.getPeriodoById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Periodo no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createPeriodoWithNivel = (req, res) => {
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Crea el Periodo
    periodoModel.createPeriodo({ nombre, categoria_coleg }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const periodo_id = result.insertId;

        // Crea la relación con nivel
        periodoNivelModel.createPeriodoNivel({ periodo_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ periodo_id });
        });
    });
};

const updatePeriodoWithNivel = (req, res) => {
    const periodo_id = req.params.id;
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Actualiza el Periodo
    periodoModel.updatePeriodo(periodo_id, { nombre, categoria_coleg }, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Actualiza la relación con nivel
        periodoNivelModel.updatePeriodoNivel(periodo_id, { nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Periodo y relación actualizados' });
        });
    });
};

const deletePeriodoWithNivel = (req, res) => {
    const periodo_id = req.params.id;

    // Elimina la relación con nivel
    periodoNivelModel.deletePeriodoNivel(periodo_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el Periodo
        periodoModel.deletePeriodo(periodo_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Periodo y relación eliminados' });
        });
    });
};

module.exports = {
    getAllPeriodo,
    getPeriodoById,
    getPeriodosByNivel,
    createPeriodoWithNivel,
    updatePeriodoWithNivel,
    deletePeriodoWithNivel
};

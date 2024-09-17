const periodoModel = require('../models/periodo');
const periodoNivelModel = require('../models/periodoNivel');

const getAllPeriodo = (req, res) => {
    periodoModel.getAllPeriodos((err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
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
    const { periodo_descripcion, periodo_codigo, id_nivel } = req.body;

    // Crea el periodo
    periodoModel.createPeriodo({ periodo_descripcion, periodo_codigo }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const id_periodo = result.insertId;

        // Crea la relación con nivel
        periodoNivelModel.createPeriodoNivel({ id_periodo, id_nivel }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id_periodo });
        });
    });
};

const updatePeriodoWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedPeriodoUpdates = ['periodo_descripcion', 'periodo_codigo'];
    const allowedPeriodoNivelUpdates = ['id_nivel'];
    const periodoFieldsToUpdate = {};
    const periodoNivelFieldsToUpdate = {};

    allowedPeriodoUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            periodoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedPeriodoNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            periodoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const periodoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(periodoFieldsToUpdate).length > 0) {
            periodoModel.updatePeriodo(id, periodoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const periodoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(periodoNivelFieldsToUpdate).length > 0) {
            periodoNivelModel.updatePeriodoNivel(id, periodoNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([periodoUpdatePromise, periodoNivelUpdatePromise])
        .then(results => {
            const [periodoResult, periodoNivelResult] = results;
            if (periodoResult.affectedRows > 0 || periodoNivelResult.affectedRows > 0) {
                res.json({ message: 'Periodo y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Periodo y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deletePeriodoWithNivel = (req, res) => {
    const id_periodo = req.params.id;

    // Elimina la relación con nivel
    periodoNivelModel.deletePeriodoNivel(id_periodo, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el periodo
        periodoModel.deletePeriodo(id_periodo, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Periodo y relación eliminados' });
        });
    });
};

module.exports = {
    getAllPeriodo,
    getPeriodosByNivel,
    getPeriodoById,
    createPeriodoWithNivel,
    updatePeriodoWithNivel,
    deletePeriodoWithNivel
};

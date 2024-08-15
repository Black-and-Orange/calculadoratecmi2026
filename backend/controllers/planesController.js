const planModel = require('../models/planDeEstudios');
const planNivelModel = require('../models/planesNivel');

const getAllPlanes = (req, res) => {
    planModel.getAllPlanesDeEstudios((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const getPlanesByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    planModel.getPlanesByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

const getPlanById = (req, res) => {
    const id = req.params.id;
    planModel.getPlanDeEstudiosById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Plan de estudio no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createPlanWithNivel = (req, res) => {
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Crea el Plan de estudio
    planModel.createPlanDeEstudios({ nombre, categoria_coleg }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const plan_id = result.insertId;

        // Crea la relación con nivel
        planNivelModel.createPlanNivel({ plan_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ plan_id });
        });
    });
};

const updatePlanWithNivel = (req, res) => {
    const plan_id = req.params.id;
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Actualiza el Plan de estudio
    planModel.updatePlanDeEstudios(plan_id, { nombre, categoria_coleg }, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Actualiza la relación con nivel
        planNivelModel.updatePlanNivel(plan_id, { nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Plan de estudio y relación actualizados' });
        });
    });
};

const deletePlanWithNivel = (req, res) => {
    const plan_id = req.params.id;

    // Elimina la relación con nivel
    planNivelModel.deletePlanNivel(plan_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el Plan de estudio
        planModel.deletePlanDeEstudios(plan_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Plan de estudio y relación eliminados' });
        });
    });
};

module.exports = {
    getAllPlanes,
    getPlanById,
    getPlanesByNivel,
    createPlanWithNivel,
    updatePlanWithNivel,
    deletePlanWithNivel
};

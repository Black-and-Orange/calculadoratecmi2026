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
    const { descripcion, tipo_plan, id_nivel } = req.body;

    // Crea el Plan de estudio
    planModel.createPlanDeEstudios({ descripcion, tipo_plan }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const plan_id = result.insertId;

        // Verifica los datos antes de pasar a la siguiente función
        if (!plan_id || !id_nivel) {
            return res.status(400).json({ error: 'plan_id o id_nivel no válidos' });
        }

        // Crea la relación con nivel
        planNivelModel.createPlanNivel({ id_plan: plan_id, id_nivel }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ plan_id });
        });
    });
};

const updatePlanWithNivel = (req, res) => {
    const id_plan = req.params.id;
    const updates = req.body;
    
    // Filtrar solo los campos permitidos para la actualización
    const allowedPlanUpdates = ['descripcion', 'tipo_plan'];
    const allowedPlanNivelUpdates = ['id_nivel'];
    const planFieldsToUpdate = {};
    const planNivelFieldsToUpdate = {};

    allowedPlanUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            planFieldsToUpdate[field] = updates[field];
        }
    });

    allowedPlanNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            planNivelFieldsToUpdate[field] = updates[field];
        }
    });

    // Promesas para actualizar el plan y el nivel
    const planUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(planFieldsToUpdate).length > 0) {
            planModel.updatePlanDeEstudios(id_plan, planFieldsToUpdate, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const planNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(planNivelFieldsToUpdate).length > 0) {
            planNivelModel.updatePlanNivel(id_plan, planNivelFieldsToUpdate, (err, result) => {
                if (err) {
                    console.error('Error al actualizar plan nivel:', err);
                    return reject(err);
                }
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    // Ejecutar ambas promesas y manejar los resultados
    Promise.all([planUpdatePromise, planNivelUpdatePromise])
        .then(results => {
            const [planResult, planNivelResult] = results;
            
            // Un UPDATE sin error es exitoso aunque affectedRows sea 0 (mismo valor / idempotente).
            res.json({ message: 'Plan y/o nivel actualizado' });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
};


const deletePlanWithNivel = (req, res) => {
    const id_plan = req.params.id;

    // Elimina la relación con nivel
    planNivelModel.deletePlanNivel(id_plan, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el Plan de estudio
        planModel.deletePlanDeEstudios(id_plan, (err) => {
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

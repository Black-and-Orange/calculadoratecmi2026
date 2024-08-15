const interesesModel = require('../models/intereses');
const interesesNivelModel = require('../models/interesesNivel');

const getIntereses = (req, res) => {
    interesesModel.getAllIntereses((err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
};

const getInteresesByNivel = (req, res) => {
    const nivelId = req.params.nivelId;

    interesesModel.getInteresesByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};



const getInteresById = (req, res) => {
    const id = req.params.id;
    interesesModel.getInteresById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Porcentaje de Interes estudiantil no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createInteresWithNivel = (req, res) => {
    const { porcentaje, nivel_id } = req.body;

    // Crea el interes
    interesesModel.createInteres({ porcentaje }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const interes_id = result.insertId;

        // Crea la relación con nivel
        interesesNivelModel.createInteresNivel({ interes_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ interes_id });
        });
    });
};

const updateInteresWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedInteresUpdates = ['porcentaje'];
    const allowedInteresNivelUpdates = ['nivel_id'];
    const interesFieldsToUpdate = {};
    const interesNivelFieldsToUpdate = {};

    allowedInteresUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            interesFieldsToUpdate[field] = updates[field];
        }
    });

    allowedInteresNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            interesNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const interesUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(interesFieldsToUpdate).length > 0) {
            interesesModel.updateInteres(id, interesFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const interesNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(interesNivelFieldsToUpdate).length > 0) {
            interesesNivelModel.updateInteresNivel(id, interesNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([interesUpdatePromise, interesNivelUpdatePromise])
        .then(results => {
            const [interesResult, interesNivelResult] = results;
            if (interesResult.affectedRows > 0 || interesNivelResult.affectedRows > 0) {
                res.json({ message: 'Interes y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Interes y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteInteresWithNivel = (req, res) => {
    const interes_id = req.params.id;

    // Elimina la relación con nivel
    interesesNivelModel.deleteInteresNivel(interes_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el interes
        interesesModel.deleteInteres(interes_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Interes y relación eliminados' });
        });
    });
};

module.exports = {
    getIntereses,
    getInteresesByNivel,
    // getRangosPorcentajeInteres,
    getInteresById,
    createInteresWithNivel,
    updateInteresWithNivel,
    deleteInteresWithNivel
};

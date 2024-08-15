const apoyosModel = require('../models/apoyos');
const apoyosNivelModel = require('../models/apoyosNivel');

const getApoyos = (req, res) => {
    apoyosModel.getAllApoyos((err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
};

const getApoyosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;

    apoyosModel.getApoyosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};



const getApoyoById = (req, res) => {
    const id = req.params.id;
    apoyosModel.getApoyoById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Porcentaje de Apoyo estudiantil no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createApoyoWithNivel = (req, res) => {
    const { porcentaje, nivel_id } = req.body;

    // Crea el apoyo
    apoyosModel.createApoyo({ porcentaje }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const apoyo_id = result.insertId;

        // Crea la relación con nivel
        apoyosNivelModel.createApoyoNivel({ apoyo_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ apoyo_id });
        });
    });
};

const updateApoyoWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedApoyoUpdates = ['porcentaje'];
    const allowedApoyoNivelUpdates = ['nivel_id'];
    const apoyoFieldsToUpdate = {};
    const apoyoNivelFieldsToUpdate = {};

    allowedApoyoUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            apoyoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedApoyoNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            apoyoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const apoyoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(apoyoFieldsToUpdate).length > 0) {
            apoyosModel.updateApoyo(id, apoyoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const apoyoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(apoyoNivelFieldsToUpdate).length > 0) {
            apoyosNivelModel.updateApoyoNivel(id, apoyoNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([apoyoUpdatePromise, apoyoNivelUpdatePromise])
        .then(results => {
            const [apoyoResult, apoyoNivelResult] = results;
            if (apoyoResult.affectedRows > 0 || apoyoNivelResult.affectedRows > 0) {
                res.json({ message: 'Apoyo y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Apoyo y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteApoyoWithNivel = (req, res) => {
    const apoyo_id = req.params.id;

    // Elimina la relación con nivel
    apoyosNivelModel.deleteApoyoNivel(apoyo_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el apoyo
        apoyosModel.deleteApoyo(apoyo_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Apoyo y relación eliminados' });
        });
    });
};

module.exports = {
    getApoyos,
    getApoyosByNivel,
    // getRangosPorcentajeApoyo,
    getApoyoById,
    createApoyoWithNivel,
    updateApoyoWithNivel,
    deleteApoyoWithNivel
};

const costoModel = require('../models/costo_materia');
const costoNivelModel = require('../models/costoMateriaNivel');

const getAllCosto = (req, res) => {
    costoModel.getAllCostos((err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
};

const getCostosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    
    costoModel.getCostosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};



const getCostoById = (req, res) => {
    const id = req.params.id;
    costoModel.getCostoById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Costo no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createCostoWithNivel = (req, res) => {
    const { clave, costo, id_nivel } = req.body;

    // Crea el costo
    costoModel.createCosto({ clave, costo }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const id_costo = result.insertId;

        // Crea la relación con nivel
        costoNivelModel.createCostoNivel({ id_costo, id_nivel }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id_costo });
        });
    });
};

const updateCostoWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedCostoUpdates = ['clave', 'costo'];
    const allowedCostoNivelUpdates = ['id_nivel'];
    const costoFieldsToUpdate = {};
    const costoNivelFieldsToUpdate = {};

    allowedCostoUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            costoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedCostoNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            costoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const costoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(costoFieldsToUpdate).length > 0) {
            costoModel.updateCosto(id, costoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const costoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(costoNivelFieldsToUpdate).length > 0) {
            costoNivelModel.updateCostoNivel(id, costoNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([costoUpdatePromise, costoNivelUpdatePromise])
        .then(results => {
            const [costoResult, costoNivelResult] = results;
            if (costoResult.affectedRows > 0 || costoNivelResult.affectedRows > 0) {
                res.json({ message: 'Costo y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Costo y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteCostoWithNivel = (req, res) => {
    const id_costo = req.params.id;

    // Elimina la relación con nivel
    costoNivelModel.deleteCostoNivel(id_costo, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el costo
        costoModel.deleteCosto(id_costo, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Costo y relación eliminados' });
        });
    });
};

module.exports = {
    getAllCosto,
    getCostosByNivel,
    getCostoById,
    createCostoWithNivel,
    updateCostoWithNivel,
    deleteCostoWithNivel
};

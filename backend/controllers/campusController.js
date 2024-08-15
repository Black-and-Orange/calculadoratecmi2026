const campusModel = require('../models/campus');
const campusNivelModel = require('../models/campusNivel');

const getAllCampus = (req, res) => {
    campusModel.getAllCampuses((err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
};

const getCampusesByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    
    campusModel.getCampusesByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};



const getCampusById = (req, res) => {
    const id = req.params.id;
    campusModel.getCampusById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Campus no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createCampusWithNivel = (req, res) => {
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Crea el campus
    campusModel.createCampus({ nombre, categoria_coleg }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const campus_id = result.insertId;

        // Crea la relación con nivel
        campusNivelModel.createCampusNivel({ campus_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ campus_id });
        });
    });
};

const updateCampusWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedCampusUpdates = ['nombre', 'categoria_coleg'];
    const allowedCampusNivelUpdates = ['nivel_id'];
    const campusFieldsToUpdate = {};
    const campusNivelFieldsToUpdate = {};

    allowedCampusUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            campusFieldsToUpdate[field] = updates[field];
        }
    });

    allowedCampusNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            campusNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const campusUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(campusFieldsToUpdate).length > 0) {
            campusModel.updateCampus(id, campusFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const campusNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(campusNivelFieldsToUpdate).length > 0) {
            campusNivelModel.updateCampusNivel(id, campusNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([campusUpdatePromise, campusNivelUpdatePromise])
        .then(results => {
            const [campusResult, campusNivelResult] = results;
            if (campusResult.affectedRows > 0 || campusNivelResult.affectedRows > 0) {
                res.json({ message: 'Campus y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Campus y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteCampusWithNivel = (req, res) => {
    const campus_id = req.params.id;

    // Elimina la relación con nivel
    campusNivelModel.deleteCampusNivel(campus_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el campus
        campusModel.deleteCampus(campus_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Campus y relación eliminados' });
        });
    });
};

module.exports = {
    getAllCampus,
    getCampusesByNivel,
    getCampusById,
    createCampusWithNivel,
    updateCampusWithNivel,
    deleteCampusWithNivel
};
